"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGNAL_TYPE_PARTICIPANT_REQUEST = exports.SIGNAL_TYPE_PARTICIPANT_UPDATE = void 0;
const sdp_transform_1 = __importDefault(require("sdp-transform"));
const getApiClient_1 = __importDefault(require("../../service/getApiClient"));
const Emitter_1 = __importDefault(require("../../utils/Emitter"));
const index_1 = __importDefault(require("../index"));
const RemoteParticipant_1 = __importDefault(require("./RemoteParticipant"));
const IssueReporter_1 = __importDefault(require("../../service/IssueReporter"));
exports.SIGNAL_TYPE_PARTICIPANT_UPDATE = 'signal/PARTICIPANT_UPDATE';
exports.SIGNAL_TYPE_PARTICIPANT_REQUEST = 'signal/PARTICIPANT_REQUEST';
const logger = IssueReporter_1.default.loggerFor('sdk-room');
class Room extends Emitter_1.default {
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
        this.CONFERENCE_USER_PARTICIPANT_JOINED = index_1.default.Websocket.CONFERENCE_USER_PARTICIPANT_JOINED;
        this.CONFERENCE_USER_PARTICIPANT_LEFT = index_1.default.Websocket.CONFERENCE_USER_PARTICIPANT_LEFT;
        this.MEETING_USER_PARTICIPANT_JOINED = index_1.default.Websocket.MEETING_USER_PARTICIPANT_JOINED;
        this.MEETING_USER_PARTICIPANT_LEFT = index_1.default.Websocket.MEETING_USER_PARTICIPANT_LEFT;
        this.ON_SHARE_SCREEN_ENDED = index_1.default.Phone.ON_SHARE_SCREEN_ENDED;
        this.ON_MESSAGE = index_1.default.Phone.ON_MESSAGE;
        this.ON_CHAT = index_1.default.Phone.ON_CHAT;
        this.ON_SIGNAL = index_1.default.Phone.ON_SIGNAL;
        this.ON_AUDIO_STREAM = index_1.default.Phone.ON_AUDIO_STREAM;
        this.ON_VIDEO_STREAM = index_1.default.Phone.ON_VIDEO_STREAM;
        this.ON_REMOVE_STREAM = index_1.default.Phone.ON_REMOVE_STREAM;
        this.ON_VIDEO_INPUT_CHANGE = index_1.default.Phone.ON_VIDEO_INPUT_CHANGE;
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
    static connect({ extension, constraints, audioOnly = false, extra, room, meeting, }) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('connecting to room', {
                extension,
                audioOnly,
                room: !!room,
            });
            if (!room) {
                yield index_1.default.Phone.connect({
                    media: constraints,
                });
                const withCamera = constraints && !!constraints.video;
                if (withCamera) {
                    index_1.default.Phone.checkSfu();
                }
                // Call_created is triggered before call_accepted, so we have to listen for it here.
                index_1.default.Websocket.once(index_1.default.Websocket.CALL_CREATED, ({ data, }) => {
                    logger.info('room call received via WS', {
                        callId: data.call_id,
                    });
                    if (room) {
                        room.setCallId(data.call_id);
                    }
                });
                const callSession = yield index_1.default.Phone.call(extension, withCamera, null, audioOnly, true);
                // eslint-disable-next-line no-param-reassign
                room = new Room(callSession, extension, null, null, extra);
                // Wait for the call to be accepted
                yield new Promise((resolve, reject) => {
                    index_1.default.Phone.once(index_1.default.Phone.ON_CALL_ACCEPTED, resolve);
                    index_1.default.Phone.once(index_1.default.Phone.ON_CALL_FAILED, reject);
                });
            }
            if (room && room.callSession && room.callSession.call) {
                room.setCallId(room.callSession.call.id);
            }
            if (!meeting) {
                // Fetch conference source
                const sources = yield (0, getApiClient_1.default)().dird.fetchConferenceSource('default');
                // Retrieve conference sources
                const contacts = yield (0, getApiClient_1.default)().dird.fetchConferenceContacts(sources.items[0]);
                // Retrieve conference
                const conference = contacts === null || contacts === void 0 ? void 0 : contacts.find(contact => { var _a; return (_a = contact.numbers) === null || _a === void 0 ? void 0 : _a.find(number => number.number === extension); });
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
        });
    }
    static disconnect() {
        logger.info('static disconnection to room');
        index_1.default.Phone.disconnect();
    }
    disconnect() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('disconnection to room called');
            yield index_1.default.Phone.hangup(this.callSession);
            this.callSession = null;
            this.eventEmitter.emit(this.ON_DISCONNECTED, this);
            this.connected = false;
            this.unbind();
            index_1.default.Phone.off(this.ON_MESSAGE, this._boundOnMessage);
            index_1.default.Phone.off(this.ON_CHAT, this._boundOnChat);
            index_1.default.Phone.off(this.ON_SIGNAL, this._boundOnSignal);
            index_1.default.Phone.off(this.ON_VIDEO_INPUT_CHANGE, this._boundSaveLocalVideoStream);
            (_a = index_1.default.Phone.phone) === null || _a === void 0 ? void 0 : _a.off(index_1.default.Phone.phone.client.ON_REINVITE, this._boundOnReinvite);
            index_1.default.Websocket.off(this.CONFERENCE_USER_PARTICIPANT_JOINED, this._boundOnParticipantJoined);
            index_1.default.Websocket.off(this.CONFERENCE_USER_PARTICIPANT_LEFT, this._boundOnParticipantLeft);
            index_1.default.Websocket.off(this.MEETING_USER_PARTICIPANT_JOINED, this._boundOnParticipantJoined);
            index_1.default.Websocket.off(this.MEETING_USER_PARTICIPANT_LEFT, this._boundOnParticipantLeft);
        });
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
        return index_1.default.Phone.sendMessage(body, sipSession);
    }
    sendChat(content) {
        return index_1.default.Phone.sendChat(content);
    }
    sendSignal(content) {
        return index_1.default.Phone.sendSignal(content);
    }
    startScreenSharing(constraints) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('start room screen sharing', {
                constraints,
            });
            const screensharingStream = yield index_1.default.Phone.startScreenSharing(constraints, this.callSession);
            if (!screensharingStream) {
                console.warn('screensharing stream is null (likely due to user cancellation)');
                return null;
            }
            this._onScreenSharing();
            return screensharingStream;
        });
    }
    stopScreenSharing(restoreLocalStream = true) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('stop room screen sharing');
            yield index_1.default.Phone.stopScreenSharing(this.callSession, restoreLocalStream);
            if (this.localParticipant) {
                this._updateLocalParticipantStream();
                this.localParticipant.onStopScreensharing();
            }
        });
    }
    turnCameraOff() {
        logger.info('turn room camera off');
        index_1.default.Phone.turnCameraOff(this.callSession);
        if (this.localParticipant) {
            this.localParticipant.onVideoMuted();
        }
    }
    turnCameraOn() {
        logger.info('turn room camera on');
        index_1.default.Phone.turnCameraOn(this.callSession);
        if (this.localParticipant) {
            this.localParticipant.onVideoUnMuted();
        }
    }
    mute() {
        logger.info('mute room');
        index_1.default.Phone.mute(this.callSession);
        this.sendMuteStatus();
    }
    unmute() {
        logger.info('unmute room');
        index_1.default.Phone.unmute(this.callSession);
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
        index_1.default.Phone.hold(this.callSession);
        if (this.localParticipant) {
            this.localParticipant.onHold();
        }
    }
    resume() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('resume room');
            const newStream = yield index_1.default.Phone.resume(this.callSession);
            if (this.localParticipant) {
                // Update local participant stream (useful when resuming a shreenshared conference)
                this._updateLocalParticipantStream();
                this.localParticipant.onResume();
                if (!newStream && this.localParticipant.screensharing) {
                    this.localParticipant.onStopScreensharing();
                }
            }
        });
    }
    _updateLocalParticipantStream() {
        const localStream = index_1.default.Phone.getLocalStream(this.callSession);
        if (this.localParticipant && localStream) {
            const localWazoStream = new index_1.default.Stream(localStream);
            this.localParticipant.resetStreams([localWazoStream]);
        }
    }
    sendDTMF(tone) {
        logger.info('send room DTMF', {
            tone,
        });
        index_1.default.Phone.sendDTMF(tone, this.callSession);
    }
    sendReinvite(newConstraints = null) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('send room reinvite', {
                callId: this.callSession ? this.callSession.getId() : null,
                newConstraints,
            });
            const wasScreensharing = this.localParticipant && this.localParticipant.screensharing;
            index_1.default.Phone.on(index_1.default.Phone.ON_SHARE_SCREEN_STARTED, () => {
                if (index_1.default.Phone.phone && index_1.default.Phone.phone.currentScreenShare) {
                    this._onScreenSharing();
                }
            });
            const response = yield ((_a = index_1.default.Phone.phone) === null || _a === void 0 ? void 0 : _a.sendReinvite(this.callSession, newConstraints, true));
            if (this.localParticipant && newConstraints && newConstraints.video) {
                const localVideoStream = (_b = index_1.default.Phone.phone) === null || _b === void 0 ? void 0 : _b.getLocalVideoStream(this.callSession);
                if (localVideoStream) {
                    this._associateStreamTo(localVideoStream, this.localParticipant);
                }
            }
            else if (this.localParticipant && wasScreensharing && newConstraints && !newConstraints.video) {
                // Downgrade from screenshare to audio
                this.localParticipant.onStopScreensharing();
            }
            return response;
        });
    }
    hasALocalVideoTrack() {
        return index_1.default.Phone.hasALocalVideoTrack(this.callSession);
    }
    getLocalStream() {
        return index_1.default.Phone.getLocalStream(this.callSession);
    }
    getRemoteStream() {
        return index_1.default.Phone.getRemoteStream(this.callSession);
    }
    getRemoteVideoStream() {
        return index_1.default.Phone.getRemoteVideoStream(this.callSession);
    }
    _bindEvents() {
        if (!index_1.default.Phone.phone || !index_1.default.Phone.phone.currentSipSession) {
            return;
        }
        // Retrieve mapping
        // @ts-ignore
        index_1.default.Phone.phone.currentSipSession.sessionDescriptionHandler.on('setDescription', ({ type, sdp: rawSdp, }) => {
            if (type !== 'offer') {
                return;
            }
            this._mapMsid(rawSdp);
        });
        // Listen to REINVITE to ba able to map msid after upgrading to video in a  audio only conference
        // This allow to map msid with the non parsed (eg without the `stripVideo` modifier) SDP
        index_1.default.Phone.phone.on(index_1.default.Phone.phone.client.ON_REINVITE, this._boundOnReinvite);
        this.on(this.ON_AUDIO_STREAM, stream => {
            var _a, _b, _c;
            logger.info('on room audio stream');
            this.audioStream = stream;
            if (!this.roomAudioElement) {
                const sessionId = (_a = index_1.default.Phone.phone) === null || _a === void 0 ? void 0 : _a.getSipSessionId((_b = index_1.default.Phone.phone) === null || _b === void 0 ? void 0 : _b.currentSipSession);
                this.roomAudioElement = (_c = index_1.default.Phone.phone) === null || _c === void 0 ? void 0 : _c.createAudioElementFor(sessionId);
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
        const sdp = sdp_transform_1.default.parse(rawSdp);
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
        index_1.default.Websocket.on(this.CONFERENCE_USER_PARTICIPANT_JOINED, this._boundOnParticipantJoined);
        index_1.default.Websocket.on(this.CONFERENCE_USER_PARTICIPANT_LEFT, this._boundOnParticipantLeft);
        index_1.default.Websocket.on(this.MEETING_USER_PARTICIPANT_JOINED, this._boundOnParticipantJoined);
        index_1.default.Websocket.on(this.MEETING_USER_PARTICIPANT_LEFT, this._boundOnParticipantLeft);
        // Phone events
        index_1.default.Phone.on(this.ON_MESSAGE, this._boundOnMessage);
        index_1.default.Phone.on(this.ON_CHAT, this._boundOnChat);
        index_1.default.Phone.on(this.ON_SIGNAL, this._boundOnSignal);
        index_1.default.Phone.on(this.ON_VIDEO_INPUT_CHANGE, this._boundSaveLocalVideoStream);
        [this.ON_AUDIO_STREAM, this.ON_VIDEO_STREAM, this.ON_REMOVE_STREAM].forEach(event => index_1.default.Phone.on(event, (...args) => this.eventEmitter.emit.apply(this.eventEmitter, [event, ...args])));
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
            case exports.SIGNAL_TYPE_PARTICIPANT_UPDATE:
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
            case exports.SIGNAL_TYPE_PARTICIPANT_REQUEST:
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
            case index_1.default.Phone.ON_MESSAGE_TRACK_UPDATED:
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
        this.eventEmitter.emit(index_1.default.Phone.ON_SIGNAL, content);
    }
    _onParticipantJoined(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const participant = payload.data;
            const session = index_1.default.Auth.getSession();
            let participants = [];
            // When we join the room, we can call `getConferenceParticipantsAsUser`, not before.
            if (participant.user_uuid === (session === null || session === void 0 ? void 0 : session.uuid)) {
                logger.info('room current user joined');
                // Retrieve participants via an API calls
                const conferenceId = this.sourceId || payload.data.conference_id;
                let response;
                try {
                    if (this.meetingUuid) {
                        logger.info('fetching meeting participants', {
                            meetingUuid: this.meetingUuid,
                        });
                        response = yield (0, getApiClient_1.default)().calld.getMeetingParticipantsAsUser(this.meetingUuid);
                    }
                    else {
                        logger.info('fetching conference participants', {
                            conferenceId,
                        });
                        response = yield (0, getApiClient_1.default)().calld.getConferenceParticipantsAsUser(conferenceId);
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
                        return isMe && item.call_id ? new index_1.default.LocalParticipant(this, item, this.extra) : new index_1.default.RemoteParticipant(this, item);
                    });
                    this.participants = participants;
                    const localParticipant = participants.find((someParticipant) => someParticipant instanceof index_1.default.LocalParticipant);
                    if (!this.localParticipant && localParticipant) {
                        this._onLocalParticipantJoined(localParticipant);
                    }
                    participants.forEach((someParticipant) => this._isParticipantJoining(someParticipant));
                    this.eventEmitter.emit(this.ON_JOINED, localParticipant, participants);
                }
                return this.participants;
            }
            const remoteParticipant = !this.participants.some(p => p.callId === participant.call_id) ? new index_1.default.RemoteParticipant(this, participant) : null;
            logger.info('other room user joined', {
                callId: participant.call_id,
                remoteParticipant: !!remoteParticipant,
            });
            if (remoteParticipant) {
                this.participants.push(remoteParticipant);
                this._isParticipantJoining(remoteParticipant);
            }
            return remoteParticipant;
        });
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
                type: exports.SIGNAL_TYPE_PARTICIPANT_REQUEST,
                origin: this.localParticipant.getStatus(),
            });
        }
    }
    _isParticipantJoining(participant) {
        this.__associateStreams(participant);
        // @VALIDATE: no need to publicize ourselves, no?
        if (participant instanceof RemoteParticipant_1.default) {
            this.eventEmitter.emit(this.CONFERENCE_USER_PARTICIPANT_JOINED, participant);
        }
    }
    _saveLocalVideoStream(stream) {
        const { localParticipant, } = this;
        if (!localParticipant) {
            return;
        }
        const videoStream = new index_1.default.Stream(stream, localParticipant);
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
        const pc = index_1.default.Phone.phone.currentSipSession.sessionDescriptionHandler.peerConnection;
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
        const stream = new index_1.default.Stream(rawStream, participant);
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
        return index_1.default.Phone.getLocalVideoStream(this.callSession);
    }
}
exports.default = Room;
