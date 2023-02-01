import { SessionState } from 'sip.js/lib/api/session-state';
import AdHocAPIConference from '../domain/AdHocAPIConference';
import WebRTCPhone, * as PHONE_EVENTS from '../domain/Phone/WebRTCPhone';
import { MESSAGE_TYPE_CHAT, MESSAGE_TYPE_SIGNAL } from '../domain/Phone/WebRTCPhone';
import WazoWebRTCClient, { events as clientEvents, transportEvents } from '../web-rtc-client';
import IssueReporter from '../service/IssueReporter';
import Emitter from '../utils/Emitter';
import Wazo from './index';
import SFUNotAvailableError from '../domain/SFUNotAvailableError';
const logger = IssueReporter.loggerFor('simple-phone');
const sipLogger = IssueReporter.loggerFor('sip.js');
const protocolLogger = IssueReporter.loggerFor('sip');
const protocolDebugMessages = ['Received WebSocket text message:', 'Sending WebSocket message:'];
class Phone extends Emitter {
    client;
    phone;
    session;
    sipLine;
    SessionState;
    ON_USER_AGENT;
    ON_REGISTERED;
    ON_UNREGISTERED;
    ON_PROGRESS;
    ON_CALL_ACCEPTED;
    ON_CALL_ANSWERED;
    ON_CALL_INCOMING;
    ON_CALL_OUTGOING;
    ON_CALL_MUTED;
    ON_CALL_UNMUTED;
    ON_CALL_RESUMED;
    ON_CALL_HELD;
    ON_CALL_UNHELD;
    ON_CAMERA_DISABLED;
    ON_CAMERA_RESUMED;
    ON_CALL_CANCELED;
    ON_CALL_FAILED;
    ON_CALL_REJECTED;
    ON_CALL_ENDED;
    ON_CALL_ENDING;
    ON_MESSAGE;
    ON_REINVITE;
    ON_TRACK;
    ON_AUDIO_STREAM;
    ON_VIDEO_STREAM;
    ON_REMOVE_STREAM;
    ON_SHARE_SCREEN_STARTED;
    ON_SHARE_SCREEN_ENDING;
    ON_SHARE_SCREEN_ENDED;
    ON_TERMINATE_SOUND;
    ON_PLAY_RING_SOUND;
    ON_PLAY_INBOUND_CALL_SIGNAL_SOUND;
    ON_PLAY_HANGUP_SOUND;
    ON_PLAY_PROGRESS_SOUND;
    ON_VIDEO_INPUT_CHANGE;
    ON_CALL_ERROR;
    ON_MESSAGE_TRACK_UPDATED;
    ON_NETWORK_STATS;
    ON_CHAT;
    ON_SIGNAL;
    ON_DISCONNECTED;
    ON_EARLY_MEDIA;
    MESSAGE_TYPE_CHAT;
    MESSAGE_TYPE_SIGNAL;
    constructor() {
        super();
        // Sugar syntax for `Wazo.Phone.EVENT_NAME`
        Object.keys(PHONE_EVENTS).forEach((key) => {
            // @ts-ignore
            this[key] = PHONE_EVENTS[key];
        });
        this.SessionState = SessionState;
    }
    async connect(options = {}, sipLine = null) {
        if (this.phone) {
            // Already connected
            // let's update media constraints if they're being fed
            if (options.media) {
                this.phone.setMediaConstraints(options.media);
            }
            return;
        }
        const server = Wazo.Auth.getHost();
        const session = Wazo.Auth.getSession();
        if (!server || !session) {
            throw new Error('Please connect to the server using `Wazo.Auth.logIn` or `Wazo.Auth.authenticate` before using Room.connect().');
        }
        this.session = session;
        this.sipLine = sipLine || this.getPrimaryWebRtcLine();
        if (!this.sipLine) {
            throw new Error('Sorry, no sip lines found for this user');
        }
        this.connectWithCredentials(server, this.sipLine, session.displayName(), options);
    }
    connectWithCredentials(server, sipLine, displayName, rawOptions = {}) {
        if (this.phone) {
            // Already connected
            return;
        }
        const [host, port = 443] = server.split(':');
        const options = rawOptions;
        options.media = options.media || {
            audio: true,
            video: false,
        };
        options.uaConfigOverrides = options.uaConfigOverrides || {};
        if (IssueReporter.enabled) {
            options.uaConfigOverrides.traceSip = true;
            options.log = options.log || {};
            options.log.builtinEnabled = false;
            options.log.logLevel = 'debug';
            options.log.connector = (level, className, label, content) => {
                const protocolIndex = content && content.indexOf ? protocolDebugMessages.findIndex(prefix => content.indexOf(prefix) !== -1) : -1;
                if (className === 'sip.Transport' && protocolIndex !== -1) {
                    const direction = protocolIndex === 0 ? 'receiving' : 'sending';
                    const message = content.replace(`${protocolDebugMessages[protocolIndex]}\n\n`, '').replace('\r\n', '\n');
                    protocolLogger.trace(message, {
                        className,
                        direction,
                    });
                }
                else {
                    sipLogger.trace(content, {
                        className,
                    });
                }
            };
        }
        this.client = new WazoWebRTCClient({
            host,
            port: typeof port === 'string' ? parseInt(port, 10) : port,
            displayName,
            authorizationUser: sipLine.username,
            password: sipLine.secret,
            uri: `${sipLine.username}@${server}`,
            ...options,
        }, null, options.uaConfigOverrides);
        this.phone = new WebRTCPhone(this.client, options.audioDeviceOutput, true, options.audioDeviceRing);
        this._transferEvents();
    }
    async disconnect() {
        if (this.phone) {
            if (this.phone.hasAnActiveCall()) {
                logger.info('hangup call on disconnect');
                await this.phone.hangup(null);
            }
            await this.phone.close();
        }
        this.phone = null;
    }
    // If audioOnly is set to true, all video stream will be deactivated, even remotes ones.
    async call(extension, withCamera = false, rawSipLine = null, audioOnly = false, conference = false) {
        if (!this.phone) {
            return;
        }
        const sipLine = rawSipLine || this.getPrimaryWebRtcLine();
        return this.phone.makeCall(extension, sipLine, withCamera, audioOnly, conference);
    }
    async hangup(callSession) {
        logger.info('hangup via simple phone', {
            callId: callSession.getId(),
        });
        return this.phone ? this.phone.hangup(callSession) : false;
    }
    async accept(callSession, cameraEnabled) {
        logger.info('accept via simple phone', {
            callId: callSession.getId(),
            cameraEnabled,
        });
        return this.phone ? this.phone.accept(callSession, cameraEnabled) : null;
    }
    async startConference(host, otherCalls) {
        const participants = [host, ...otherCalls].reduce((acc, participant) => {
            acc[participant.getTalkingToIds()[0]] = participant;
            return acc;
        }, {});
        if (!this.phone) {
            return Promise.reject();
        }
        const adHocConference = new AdHocAPIConference({
            phone: this.phone,
            host,
            participants,
        });
        return adHocConference.start();
    }
    mute(callSession, withApi = true) {
        if (withApi) {
            this.muteViaAPI(callSession);
        }
        this.phone?.mute(callSession);
    }
    unmute(callSession, withApi = true) {
        if (withApi) {
            this.unmuteViaAPI(callSession);
        }
        this.phone?.unmute(callSession);
    }
    muteViaAPI(callSession) {
        if (callSession && callSession.callId) {
            Wazo.getApiClient().calld.mute(callSession.callId).catch(e => {
                logger.error('Mute via API, error', e);
            });
        }
    }
    unmuteViaAPI(callSession) {
        if (callSession && callSession.callId) {
            Wazo.getApiClient().calld.unmute(callSession.callId).catch(e => {
                logger.error('Unmute via API, error', e);
            });
        }
    }
    hold(callSession) {
        return this.phone?.hold(callSession, true);
    }
    async unhold(callSession) {
        return this.phone?.unhold(callSession, true);
    }
    async resume(callSession) {
        return this.phone?.resume(callSession) || null;
    }
    reject(callSession) {
        return this.phone?.reject(callSession);
    }
    transfer(callSession, target) {
        this.phone?.transfer(callSession, target);
    }
    atxfer(callSession) {
        return this.phone?.atxfer(callSession) || null;
    }
    async reinvite(callSession, constraints = null, conference = false) {
        return this.phone ? this.phone.sendReinvite(callSession, constraints, conference) : null;
    }
    async getStats(callSession) {
        return this.phone ? this.phone.getStats(callSession) : null;
    }
    startNetworkMonitoring(callSession, interval = 1000) {
        return this.phone ? this.phone.startNetworkMonitoring(callSession, interval) : null;
    }
    stopNetworkMonitoring(callSession) {
        return this.phone ? this.phone.stopNetworkMonitoring(callSession) : null;
    }
    getSipSessionId(sipSession) {
        if (!sipSession || !this.phone) {
            return null;
        }
        return this.phone.getSipSessionId(sipSession);
    }
    sendMessage(body, sipSession, contentType = 'text/plain') {
        const toSipSession = sipSession || this.getCurrentSipSession();
        if (!toSipSession || !this.phone) {
            return;
        }
        this.phone.sendMessage(toSipSession, body, contentType);
    }
    sendChat(content, sipSession) {
        this.sendMessage(JSON.stringify({
            type: MESSAGE_TYPE_CHAT,
            content,
        }), sipSession, 'application/json');
    }
    sendSignal(content, sipSession) {
        this.sendMessage(JSON.stringify({
            type: MESSAGE_TYPE_SIGNAL,
            content,
        }), sipSession, 'application/json');
    }
    turnCameraOff(callSession) {
        this.phone?.turnCameraOff(callSession);
    }
    turnCameraOn(callSession) {
        this.phone?.turnCameraOn(callSession);
    }
    async startScreenSharing(constraints, callSession) {
        return this.phone?.startScreenSharing(constraints, callSession) || null;
    }
    stopScreenSharing(callSession, restoreLocalStream = true) {
        return this.phone ? this.phone.stopScreenSharing(restoreLocalStream, callSession) : Promise.resolve();
    }
    sendDTMF(tone, callSession) {
        this.phone?.sendKey(callSession, tone);
    }
    getLocalStream(callSession) {
        return this.phone?.getLocalStream(callSession);
    }
    hasLocalVideo(callSession) {
        return this.phone?.hasLocalVideo(callSession) || false;
    }
    hasALocalVideoTrack(callSession) {
        return this.phone?.hasALocalVideoTrack(callSession) || false;
    }
    // @Deprecated
    getLocalMediaStream(callSession) {
        logger.warn('Phone.getLocalMediaStream is deprecated, use Phone.getLocalStream instead');
        return this.phone?.getLocalStream(callSession);
    }
    getLocalVideoStream(callSession) {
        return this.phone?.getLocalVideoStream(callSession) || null;
    }
    getRemoteStream(callSession) {
        return this.phone?.getRemoteStream(callSession) || null;
    }
    getRemoteVideoStream(callSession) {
        return this.phone?.getRemoteVideoStream(callSession) || null;
    }
    isVideoRemotelyHeld(callSession) {
        return this.phone?.isVideoRemotelyHeld(callSession) || false;
    }
    // @Deprecated
    getRemoteStreamForCall(callSession) {
        logger.warn('Phone.getRemoteStreamForCall is deprecated, use Phone.getRemoteStream instead');
        return this.getRemoteStream(callSession) || null;
    }
    // Returns remote streams directly from the peerConnection
    // @Deprecated
    getRemoteStreamsForCall(callSession) {
        logger.warn('Phone.getRemoteStreamsForCall is deprecated, use Phone.getLocalStream instead');
        return this.getLocalStream(callSession) || null;
    }
    // @Deprecated
    getRemoteVideoStreamForCall(callSession) {
        logger.warn('Phone.getRemoteVideoStreamForCall is deprecated, use Phone.getRemoteVideoStream instead');
        return this.getRemoteVideoStream(callSession);
    }
    //  Useful in a react-native environment when remoteMediaStream is not updated
    getRemoteVideoStreamFromPc(callSession) {
        return this.phone?.getRemoteVideoStreamFromPc(callSession) || null;
    }
    hasVideo(callSession) {
        return this.phone ? this.phone.hasVideo(callSession) : false;
    }
    hasAVideoTrack(callSession) {
        return this.phone ? this.phone.hasAVideoTrack(callSession) : false;
    }
    getCurrentSipSession() {
        return this.phone?.currentSipSession || null;
    }
    getPrimaryWebRtcLine() {
        const session = Wazo.Auth.getSession();
        return session?.primaryWebRtcLine() || null;
    }
    getOutputDevice() {
        return this.phone?.audioOutputDeviceId || null;
    }
    getPrimaryLine() {
        const session = Wazo.Auth.getSession();
        return session?.primarySipLine() || null;
    }
    getLineById(lineId) {
        return this.getSipLines().find(line => line && line.id === lineId) || null;
    }
    getSipLines() {
        const session = Wazo.Auth.getSession();
        if (!session) {
            return [];
        }
        return session.profile?.sipLines || [];
    }
    hasSfu() {
        return this.sipLine?.hasVideoConference() || false;
    }
    checkSfu() {
        if (!this.hasSfu()) {
            throw new SFUNotAvailableError();
        }
    }
    _transferEvents() {
        this.unbind();
        [...clientEvents, ...transportEvents].forEach(event => {
            this.client.on(event, (...args) => this.eventEmitter.emit.apply(this.eventEmitter.emit, [`client-${event}`, ...args]));
        });
        Object.values(PHONE_EVENTS).forEach(event => {
            if (typeof event !== 'string' || !this.phone) {
                return;
            }
            this.phone.on(event, (...args) => this.eventEmitter.emit.apply(this.eventEmitter, [event, ...args]));
        });
    }
}
if (!global.wazoTelephonyInstance) {
    global.wazoTelephonyInstance = new Phone();
}
export default global.wazoTelephonyInstance;
