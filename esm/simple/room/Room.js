import sdpParser from 'sdp-transform';
import getApiClient from '../../service/getApiClient';
import Emitter from '../../utils/Emitter';
import Wazo from '../index';
import RemoteParticipant from './RemoteParticipant';
import IssueReporter from '../../service/IssueReporter';
export const SIGNAL_TYPE_PARTICIPANT_UPDATE = 'signal/PARTICIPANT_UPDATE';
export const SIGNAL_TYPE_PARTICIPANT_REQUEST = 'signal/PARTICIPANT_REQUEST';
const logger = IssueReporter.loggerFor('sdk-room');
class Room extends Emitter {
    callSession;
    name;
    extension;
    sourceId;
    meetingUuid;
    participants;
    callId;
    connected;
    localParticipant;
    _callIdStreamIdMap;
    _unassociatedVideoStreams;
    _unassociatedParticipants;
    _boundOnParticipantJoined;
    _boundOnParticipantLeft;
    _boundOnMessage;
    _boundOnChat;
    _boundOnSignal;
    _boundSaveLocalVideoStream;
    _boundOnReinvite;
    audioStream;
    extra;
    // video tag representing the room audio stream
    roomAudioElement;
    CONFERENCE_USER_PARTICIPANT_JOINED;
    CONFERENCE_USER_PARTICIPANT_LEFT;
    MEETING_USER_PARTICIPANT_JOINED;
    MEETING_USER_PARTICIPANT_LEFT;
    ON_SHARE_SCREEN_ENDED;
    ON_MESSAGE;
    ON_CHAT;
    ON_SIGNAL;
    ON_AUDIO_STREAM;
    ON_VIDEO_STREAM;
    ON_REMOVE_STREAM;
    ON_DISCONNECTED;
    ON_JOINED;
    ON_VIDEO_INPUT_CHANGE;
    /**
     *
     * @param callSession CallSession
     * @param extension string
     * @param sourceId number
     * @param callId string
     * @param meetingUuid string
     * @param extra Object
     */
    constructor(callSession, extension, sourceId, callId, meetingUuid, extra = {}) {
        super();
        logger.info('room initialized', {
            callId,
            extension,
            sourceId,
            meetingUuid,
        });
        // Represents the room callSession
        this.callSession = callSession;
        this.extension = extension;
        this.sourceId = sourceId;
        this.meetingUuid = meetingUuid;
        this.callId = callId;
        this.participants = [];
        this.connected = false;
        this.localParticipant = null;
        // [callId]: streamId
        this._callIdStreamIdMap = {};
        // Stream not yet associated to a participant, [streamId]: stream
        this._unassociatedVideoStreams = {};
        // Participant not yet associated to a stream, [participant.callId = label in setDescription]: Participant
        this._unassociatedParticipants = {};
        // The shared audio stream of the room
        this.audioStream = null;
        // Extra values passed to local participant
        this.extra = extra;
        // Sugar syntax for `room.EVENT_NAME`
        this.CONFERENCE_USER_PARTICIPANT_JOINED = Wazo.Websocket.CONFERENCE_USER_PARTICIPANT_JOINED;
        this.CONFERENCE_USER_PARTICIPANT_LEFT = Wazo.Websocket.CONFERENCE_USER_PARTICIPANT_LEFT;
        this.MEETING_USER_PARTICIPANT_JOINED = Wazo.Websocket.MEETING_USER_PARTICIPANT_JOINED;
        this.MEETING_USER_PARTICIPANT_LEFT = Wazo.Websocket.MEETING_USER_PARTICIPANT_LEFT;
        this.ON_SHARE_SCREEN_ENDED = Wazo.Phone.ON_SHARE_SCREEN_ENDED;
        this.ON_MESSAGE = Wazo.Phone.ON_MESSAGE;
        this.ON_CHAT = Wazo.Phone.ON_CHAT;
        this.ON_SIGNAL = Wazo.Phone.ON_SIGNAL;
        this.ON_AUDIO_STREAM = Wazo.Phone.ON_AUDIO_STREAM;
        this.ON_VIDEO_STREAM = Wazo.Phone.ON_VIDEO_STREAM;
        this.ON_REMOVE_STREAM = Wazo.Phone.ON_REMOVE_STREAM;
        this.ON_VIDEO_INPUT_CHANGE = Wazo.Phone.ON_VIDEO_INPUT_CHANGE;
        this.ON_DISCONNECTED = 'room/ON_DISCONNECTED';
        this.ON_JOINED = 'room/ON_JOINED';
        this._boundOnParticipantJoined = this._onParticipantJoined.bind(this);
        this._boundOnParticipantLeft = this._onParticipantLeft.bind(this);
        this._boundOnMessage = this._onMessage.bind(this);
        this._boundOnChat = this._onChat.bind(this);
        this._boundOnSignal = this._onSignal.bind(this);
        this._boundSaveLocalVideoStream = this._saveLocalVideoStream.bind(this);
        this._boundOnReinvite = this._onReinvite.bind(this);
        this.unbind();
        this._bindEvents();
        this._transferEvents();
    }
    /**
     *
     * @param extension string
     * @param constraints string
     * @param audioOnly boolean
     * @param extra Object
     * @param room ?Room
     * @param meeting ?Meeting
     * @returns {Promise<Room>}
     */
    static async connect({ extension, constraints, audioOnly = false, extra, room, meeting, }) {
        logger.info('connecting to room', {
            extension,
            audioOnly,
            room: !!room,
        });
        if (!room) {
            await Wazo.Phone.connect({
                media: constraints,
            });
            const withCamera = constraints && !!constraints.video;
            if (withCamera) {
                Wazo.Phone.checkSfu();
            }
            // Call_created is triggered before call_accepted, so we have to listen for it here.
            Wazo.Websocket.once(Wazo.Websocket.CALL_CREATED, ({ data, }) => {
                logger.info('room call received via WS', {
                    callId: data.call_id,
                });
                if (room) {
                    room.setCallId(data.call_id);
                }
            });
            const callSession = await Wazo.Phone.call(extension, withCamera, null, audioOnly, true);
            // eslint-disable-next-line no-param-reassign
            room = new Room(callSession, extension, null, null, extra);
            // Wait for the call to be accepted
            await new Promise((resolve, reject) => {
                Wazo.Phone.once(Wazo.Phone.ON_CALL_ACCEPTED, resolve);
                Wazo.Phone.once(Wazo.Phone.ON_CALL_FAILED, reject);
            });
        }
        if (room && room.callSession && room.callSession.call) {
            room.setCallId(room.callSession.call.id);
        }
        if (!meeting) {
            // Fetch conference source
            const sources = await getApiClient().dird.fetchConferenceSource('default');
            // Retrieve conference sources
            const contacts = await getApiClient().dird.fetchConferenceContacts(sources.items[0]);
            // Retrieve conference
            const conference = contacts?.find(contact => contact.numbers?.find(number => number.number === extension));
            logger.info('connected to room', {
                sourceId: conference ? conference.sourceId : null,
                name: conference ? conference.name : null,
            });
            if (conference) {
                room.setSourceId(conference.sourceId);
                room.setName(conference.name);
            }
        }
        else if (meeting) {
            logger.info('Already connected to meeting', {
                uuid: meeting.uuid,
                name: meeting.name,
            });
            room.setMeetingUuid(meeting.uuid);
            room.setName(meeting.name);
        }
        return room;
    }
    static disconnect() {
        logger.info('static disconnection to room');
        Wazo.Phone.disconnect();
    }
    async disconnect() {
        logger.info('disconnection to room called');
        await Wazo.Phone.hangup(this.callSession);
        this.callSession = null;
        this.eventEmitter.emit(this.ON_DISCONNECTED, this);
        this.connected = false;
        this.unbind();
        Wazo.Phone.off(this.ON_MESSAGE, this._boundOnMessage);
        Wazo.Phone.off(this.ON_CHAT, this._boundOnChat);
        Wazo.Phone.off(this.ON_SIGNAL, this._boundOnSignal);
        Wazo.Phone.off(this.ON_VIDEO_INPUT_CHANGE, this._boundSaveLocalVideoStream);
        Wazo.Phone.phone?.off(Wazo.Phone.phone.client.ON_REINVITE, this._boundOnReinvite);
        Wazo.Websocket.off(this.CONFERENCE_USER_PARTICIPANT_JOINED, this._boundOnParticipantJoined);
        Wazo.Websocket.off(this.CONFERENCE_USER_PARTICIPANT_LEFT, this._boundOnParticipantLeft);
        Wazo.Websocket.off(this.MEETING_USER_PARTICIPANT_JOINED, this._boundOnParticipantJoined);
        Wazo.Websocket.off(this.MEETING_USER_PARTICIPANT_LEFT, this._boundOnParticipantLeft);
    }
    setSourceId(sourceId) {
        logger.info('set room source id', {
            sourceId,
        });
        this.sourceId = sourceId;
    }
    setMeetingUuid(meetingUuid) {
        logger.info('set meeting uuid', {
            meetingUuid,
        });
        this.meetingUuid = meetingUuid;
    }
    setCallId(callId) {
        logger.info('set room call id', {
            callId,
        });
        if (callId) {
            this.callId = callId;
        }
    }
    setName(name) {
        logger.info('set room name', {
            name,
        });
        this.name = name;
    }
    // @TODO: change sipSession to callSession
    sendMessage(body, sipSession = null) {
        return Wazo.Phone.sendMessage(body, sipSession);
    }
    sendChat(content) {
        return Wazo.Phone.sendChat(content);
    }
    sendSignal(content) {
        return Wazo.Phone.sendSignal(content);
    }
    async startScreenSharing(constraints) {
        logger.info('start room screen sharing', {
            constraints,
        });
        const screensharingStream = await Wazo.Phone.startScreenSharing(constraints, this.callSession);
        if (!screensharingStream) {
            console.warn('screensharing stream is null (likely due to user cancellation)');
            return null;
        }
        this._onScreenSharing();
        return screensharingStream;
    }
    async stopScreenSharing(restoreLocalStream = true) {
        logger.info('stop room screen sharing');
        await Wazo.Phone.stopScreenSharing(this.callSession, restoreLocalStream);
        if (this.localParticipant) {
            this._updateLocalParticipantStream();
            this.localParticipant.onStopScreensharing();
        }
    }
    turnCameraOff() {
        logger.info('turn room camera off');
        Wazo.Phone.turnCameraOff(this.callSession);
        if (this.localParticipant) {
            this.localParticipant.onVideoMuted();
        }
    }
    turnCameraOn() {
        logger.info('turn room camera on');
        Wazo.Phone.turnCameraOn(this.callSession);
        if (this.localParticipant) {
            this.localParticipant.onVideoUnMuted();
        }
    }
    mute() {
        logger.info('mute room');
        Wazo.Phone.mute(this.callSession);
        this.sendMuteStatus();
    }
    unmute() {
        logger.info('unmute room');
        Wazo.Phone.unmute(this.callSession);
        this.sendUnMuteStatus();
    }
    sendMuteStatus() {
        if (this.localParticipant) {
            this.localParticipant.onAudioMuted();
        }
    }
    sendUnMuteStatus() {
        if (this.localParticipant) {
            this.localParticipant.onAudioUnMuted();
        }
    }
    hold() {
        logger.info('hold room');
        Wazo.Phone.hold(this.callSession);
        if (this.localParticipant) {
            this.localParticipant.onHold();
        }
    }
    async resume() {
        logger.info('resume room');
        const newStream = await Wazo.Phone.resume(this.callSession);
        if (this.localParticipant) {
            // Update local participant stream (useful when resuming a shreenshared conference)
            this._updateLocalParticipantStream();
            this.localParticipant.onResume();
            if (!newStream && this.localParticipant.screensharing) {
                this.localParticipant.onStopScreensharing();
            }
        }
    }
    _updateLocalParticipantStream() {
        const localStream = Wazo.Phone.getLocalStream(this.callSession);
        if (this.localParticipant && localStream) {
            const localWazoStream = new Wazo.Stream(localStream);
            this.localParticipant.resetStreams([localWazoStream]);
        }
    }
    sendDTMF(tone) {
        logger.info('send room DTMF', {
            tone,
        });
        Wazo.Phone.sendDTMF(tone, this.callSession);
    }
    async sendReinvite(newConstraints = null) {
        logger.info('send room reinvite', {
            callId: this.callSession ? this.callSession.getId() : null,
            newConstraints,
        });
        const wasScreensharing = this.localParticipant && this.localParticipant.screensharing;
        Wazo.Phone.on(Wazo.Phone.ON_SHARE_SCREEN_STARTED, () => {
            if (Wazo.Phone.phone && Wazo.Phone.phone.currentScreenShare) {
                this._onScreenSharing();
            }
        });
        const response = await Wazo.Phone.phone?.sendReinvite(this.callSession, newConstraints, true);
        if (this.localParticipant && newConstraints && newConstraints.video) {
            const localVideoStream = Wazo.Phone.phone?.getLocalVideoStream(this.callSession);
            if (localVideoStream) {
                this._associateStreamTo(localVideoStream, this.localParticipant);
            }
        }
        else if (this.localParticipant && wasScreensharing && newConstraints && !newConstraints.video) {
            // Downgrade from screenshare to audio
            this.localParticipant.onStopScreensharing();
        }
        return response;
    }
    hasALocalVideoTrack() {
        return Wazo.Phone.hasALocalVideoTrack(this.callSession);
    }
    getLocalStream() {
        return Wazo.Phone.getLocalStream(this.callSession);
    }
    getRemoteStream() {
        return Wazo.Phone.getRemoteStream(this.callSession);
    }
    getRemoteVideoStream() {
        return Wazo.Phone.getRemoteVideoStream(this.callSession);
    }
    _bindEvents() {
        if (!Wazo.Phone.phone || !Wazo.Phone.phone.currentSipSession) {
            return;
        }
        // Retrieve mapping
        // @ts-ignore
        Wazo.Phone.phone.currentSipSession.sessionDescriptionHandler.on('setDescription', ({ type, sdp: rawSdp, }) => {
            if (type !== 'offer') {
                return;
            }
            this._mapMsid(rawSdp);
        });
        // Listen to REINVITE to ba able to map msid after upgrading to video in a  audio only conference
        // This allow to map msid with the non parsed (eg without the `stripVideo` modifier) SDP
        Wazo.Phone.phone.on(Wazo.Phone.phone.client.ON_REINVITE, this._boundOnReinvite);
        this.on(this.ON_AUDIO_STREAM, stream => {
            logger.info('on room audio stream');
            this.audioStream = stream;
            if (!this.roomAudioElement) {
                const sessionId = Wazo.Phone.phone?.getSipSessionId(Wazo.Phone.phone?.currentSipSession);
                this.roomAudioElement = Wazo.Phone.phone?.createAudioElementFor(sessionId);
                this.roomAudioElement.srcObject = stream;
            }
            else {
                this.roomAudioElement.srcObject = stream;
            }
        });
        this.on(this.ON_VIDEO_STREAM, (stream, streamId, event, sipSession) => {
            logger.info('on room video stream', {
                streamId,
            });
            this._mapMsid(sipSession.body.body);
            // ON_VIDEO_STREAM is called before PARTICIPANT_JOINED, so we have to keep stream in `_unassociatedVideoStreams`.
            this._unassociatedVideoStreams[streamId] = stream;
            const callId = this._getCallIdFromTrackId(streamId);
            const participant = callId ? this._getParticipantFromCallId(callId) : null;
            if (participant) {
                this.__associateStreams(participant);
            }
        });
        this.on(this.ON_REMOVE_STREAM, stream => {
            logger.info('on room remove stream');
            const participant = this.participants.find(someParticipant => someParticipant.streams.find(someStream => someStream && someStream.id === stream.id));
            if (!participant) {
                return;
            }
            participant.videoStreams = participant.videoStreams.filter(someStream => someStream.id !== stream.id);
            participant.streams = participant.streams.filter(someStream => someStream.id !== stream.id);
            participant.onStreamUnSubscribed(stream);
        });
    }
    _onScreenSharing() {
        if (this.localParticipant) {
            this.localParticipant.onScreensharing();
        }
    }
    _onReinvite(session, inviteRequest) {
        const body = inviteRequest.body || inviteRequest.message.body;
        if (body) {
            this._mapMsid(body);
            // Re-associate video streams
            this.participants.forEach(participant => {
                this.__associateStreams(participant);
            });
        }
    }
    _mapMsid(rawSdp) {
        const sdp = sdpParser.parse(rawSdp);
        const labelMsidArray = sdp.media.filter((media) => !!media.label).map(({ label, msid, }) => ({
            label: String(label),
            streamId: msid.split(' ')[0],
            trackId: msid.split(' ')[1],
        }));
        labelMsidArray.forEach(({ label, streamId, trackId, }) => {
            this._callIdStreamIdMap[String(label)] = {
                streamId,
                trackId,
            };
            const callId = String(label);
            const participant = this._unassociatedParticipants[callId] || this._getParticipantFromCallId(callId);
            if (participant) {
                this.__associateStreams(participant);
            }
        });
    }
    _transferEvents() {
        Wazo.Websocket.on(this.CONFERENCE_USER_PARTICIPANT_JOINED, this._boundOnParticipantJoined);
        Wazo.Websocket.on(this.CONFERENCE_USER_PARTICIPANT_LEFT, this._boundOnParticipantLeft);
        Wazo.Websocket.on(this.MEETING_USER_PARTICIPANT_JOINED, this._boundOnParticipantJoined);
        Wazo.Websocket.on(this.MEETING_USER_PARTICIPANT_LEFT, this._boundOnParticipantLeft);
        // Phone events
        Wazo.Phone.on(this.ON_MESSAGE, this._boundOnMessage);
        Wazo.Phone.on(this.ON_CHAT, this._boundOnChat);
        Wazo.Phone.on(this.ON_SIGNAL, this._boundOnSignal);
        Wazo.Phone.on(this.ON_VIDEO_INPUT_CHANGE, this._boundSaveLocalVideoStream);
        [this.ON_AUDIO_STREAM, this.ON_VIDEO_STREAM, this.ON_REMOVE_STREAM].forEach(event => Wazo.Phone.on(event, (...args) => this.eventEmitter.emit.apply(this.eventEmitter, [event, ...args])));
    }
    _onMessage(message) {
        // @ts-ignore
        if (message.method !== 'MESSAGE') {
            return null;
        }
        let body;
        try {
            // @ts-ignore
            body = JSON.parse(message.body);
        }
        catch (e) {
            return null;
        }
        switch (body.type) {
            case 'ConfbridgeTalking':
                {
                    // Update participant
                    const channel = body.channels[0];
                    const { id: callId, talking_status: talkingStatus, } = channel;
                    const isTalking = talkingStatus === 'on';
                    const participantIdx = this.participants.findIndex(participant => participant.callId === callId);
                    if (participantIdx === -1) {
                        return;
                    }
                    this.participants[participantIdx].onTalking(isTalking);
                    break;
                }
            default:
        }
        this.eventEmitter.emit(this.ON_MESSAGE, body);
        return body;
    }
    _onChat(content) {
        this.eventEmitter.emit(this.ON_CHAT, content);
    }
    _onSignal(content) {
        const { type, } = content;
        switch (type) {
            // we're receiving a external update
            case SIGNAL_TYPE_PARTICIPANT_UPDATE:
                {
                    const { status, } = content;
                    const participant = this._getParticipantFromCallId(status.callId);
                    if (participant) {
                        // we're receiving, so no need to broadcast
                        participant.updateStatus(status, false);
                    }
                    break;
                }
            // this is a request to broadcast our current status
            case SIGNAL_TYPE_PARTICIPANT_REQUEST:
                {
                    const { callId, origin, } = content;
                    // callId is null, someone's requesting everyone's state;
                    // or callId is set and matches ours;
                    if (this.localParticipant && (!callId || callId === this.localParticipant.callId)) {
                        this.localParticipant.broadcastStatus(null, true);
                    }
                    // might as well update the requester's status
                    const requester = this._getParticipantFromCallId(origin.callId);
                    if (requester) {
                        // @FIXME?: when need to trigger an update on join-in; this is a bit of a hack
                        logger.info('trigger room requester status', {
                            origin,
                        });
                        requester.triggerUpdate('REQUESTER_UPDATE');
                    }
                    break;
                }
            case Wazo.Phone.ON_MESSAGE_TRACK_UPDATED:
                {
                    const { callId, update, } = content;
                    const participantIdx = this.participants.findIndex(p => p.callId === callId);
                    if (participantIdx !== -1) {
                        this.participants[participantIdx] = this._onParticipantTrackUpdate(this.participants[participantIdx], update);
                    }
                    break;
                }
            default:
                {
                    console.warn('uncaught signal', content);
                }
        }
        this.eventEmitter.emit(Wazo.Phone.ON_SIGNAL, content);
    }
    async _onParticipantJoined(payload) {
        const participant = payload.data;
        const session = Wazo.Auth.getSession();
        let participants = [];
        // When we join the room, we can call `getConferenceParticipantsAsUser`, not before.
        if (participant.user_uuid === session?.uuid) {
            logger.info('room current user joined');
            // Retrieve participants via an API calls
            const conferenceId = this.sourceId || payload.data.conference_id;
            let response;
            try {
                if (this.meetingUuid) {
                    logger.info('fetching meeting participants', {
                        meetingUuid: this.meetingUuid,
                    });
                    response = await getApiClient().calld.getMeetingParticipantsAsUser(this.meetingUuid);
                }
                else {
                    logger.info('fetching conference participants', {
                        conferenceId,
                    });
                    response = await getApiClient().calld.getConferenceParticipantsAsUser(conferenceId);
                }
            }
            catch (e) {
                logger.error('room participants fetching, error', e);
            }
            if (response) {
                logger.info('conference participants fetched', {
                    nb: response.items.length,
                });
                participants = response.items.map((item) => {
                    const isMe = item.call_id === this.callId;
                    return isMe && item.call_id ? new Wazo.LocalParticipant(this, item, this.extra) : new Wazo.RemoteParticipant(this, item);
                });
                this.participants = participants;
                const localParticipant = participants.find((someParticipant) => someParticipant instanceof Wazo.LocalParticipant);
                if (!this.localParticipant && localParticipant) {
                    this._onLocalParticipantJoined(localParticipant);
                }
                participants.forEach((someParticipant) => this._isParticipantJoining(someParticipant));
                this.eventEmitter.emit(this.ON_JOINED, localParticipant, participants);
            }
            return this.participants;
        }
        const remoteParticipant = !this.participants.some(p => p.callId === participant.call_id) ? new Wazo.RemoteParticipant(this, participant) : null;
        logger.info('other room user joined', {
            callId: participant.call_id,
            remoteParticipant: !!remoteParticipant,
        });
        if (remoteParticipant) {
            this.participants.push(remoteParticipant);
            this._isParticipantJoining(remoteParticipant);
        }
        return remoteParticipant;
    }
    _onLocalParticipantJoined(localParticipant) {
        this.localParticipant = localParticipant;
        const localVideoStream = this._getLocalVideoStream();
        if (localVideoStream) {
            this._saveLocalVideoStream(localVideoStream);
        }
        this.connected = true;
        localParticipant.broadcastStatus(null, true);
        // we're in the room, now let's request everyone's status
        if (this.localParticipant) {
            this.sendSignal({
                type: SIGNAL_TYPE_PARTICIPANT_REQUEST,
                origin: this.localParticipant.getStatus(),
            });
        }
    }
    _isParticipantJoining(participant) {
        this.__associateStreams(participant);
        // @VALIDATE: no need to publicize ourselves, no?
        if (participant instanceof RemoteParticipant) {
            this.eventEmitter.emit(this.CONFERENCE_USER_PARTICIPANT_JOINED, participant);
        }
    }
    _saveLocalVideoStream(stream) {
        const { localParticipant, } = this;
        if (!localParticipant) {
            return;
        }
        const videoStream = new Wazo.Stream(stream, localParticipant);
        if (videoStream) {
            localParticipant.resetStreams([videoStream]);
            localParticipant.onStreamSubscribed(videoStream);
        }
        return videoStream;
    }
    _onParticipantLeft(payload) {
        const leftParticipant = this.participants.find(participant => participant && participant.callId === payload.data.call_id);
        // Trigger Participant.ON_DISCONNECT event
        if (leftParticipant) {
            leftParticipant.onDisconnect();
        }
        this.participants = this.participants.filter(participant => participant && participant.callId !== payload.data.call_id);
        this.eventEmitter.emit(this.CONFERENCE_USER_PARTICIPANT_LEFT, leftParticipant);
    }
    _onParticipantTrackUpdate(oldParticipant, update) {
        const newParticipant = oldParticipant;
        const { trackId, streamId, } = this._callIdStreamIdMap[newParticipant.callId] || {};
        // @ts-ignore
        const pc = Wazo.Phone.phone.currentSipSession.sessionDescriptionHandler.peerConnection;
        // Can't use `getReceivers` here because on FF we make the mapping based on the streamId
        const stream = pc.getRemoteStreams().find((someStream) => someStream.id === streamId || someStream.getTracks().some((track) => track.id === trackId));
        if (update === 'downgrade') {
            newParticipant.resetStreams([]);
            newParticipant.onStreamUnSubscribed(stream);
            return newParticipant;
        }
        // Upgrade
        if (stream) {
            this._associateStreamTo(stream, newParticipant);
        }
        return newParticipant;
    }
    // Associate audio/video streams to the participant and triggers events on it
    __associateStreams(participant) {
        const { trackId, } = this._callIdStreamIdMap[participant.callId] || {};
        if (!trackId) {
            this._unassociatedParticipants[participant.callId] = participant;
            return;
        }
        if (!trackId || !participant || !this.localParticipant || participant.callId === this.localParticipant.callId) {
            return;
        }
        const streamId = this._getStreamIdFrTrackId(trackId);
        const key = this._getUnassociatedMapIdFromTrackIdOrStreamId(trackId, streamId);
        const stream = this._unassociatedVideoStreams[key];
        if (stream) {
            // Try to associate stream
            this._associateStreamTo(stream, participant);
            delete this._unassociatedVideoStreams[key];
            delete this._unassociatedParticipants[participant.callId];
        }
    }
    _getUnassociatedMapIdFromTrackIdOrStreamId(trackId, streamId) {
        // Find by trackId
        if (trackId in this._unassociatedVideoStreams) {
            return trackId;
        }
        // Find by streamId
        if (streamId && streamId in this._unassociatedVideoStreams) {
            return streamId;
        }
        // Find in all the streams by streamId (used on FF where we can't map by trackId)
        const idx = Object.values(this._unassociatedVideoStreams).findIndex((stream) => stream && stream.id === streamId);
        return idx === -1 ? null : Object.keys(this._unassociatedVideoStreams)[idx];
    }
    _getStreamIdFrTrackId(trackId) {
        const mapping = Object.values(this._callIdStreamIdMap).find((map) => map.trackId === trackId);
        return mapping ? mapping.streamId : null;
    }
    _associateStreamTo(rawStream, participant) {
        const stream = new Wazo.Stream(rawStream, participant);
        participant.streams.push(stream);
        participant.videoStreams.push(stream);
        participant.onStreamSubscribed(stream);
    }
    _getCallIdFromTrackId(trackId) {
        return Object.keys(this._callIdStreamIdMap).find(key => this._callIdStreamIdMap[key].trackId === trackId);
    }
    _getParticipantFromCallId(callId) {
        return this.participants.find(participant => participant.callId === callId);
    }
    _getLocalVideoStream() {
        return Wazo.Phone.getLocalVideoStream(this.callSession);
    }
}
export default Room;
