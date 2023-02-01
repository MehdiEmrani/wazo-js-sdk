"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const session_state_1 = require("sip.js/lib/api/session-state");
const AdHocAPIConference_1 = __importDefault(require("../domain/AdHocAPIConference"));
const WebRTCPhone_1 = __importStar(require("../domain/Phone/WebRTCPhone")), PHONE_EVENTS = WebRTCPhone_1;
const WebRTCPhone_2 = require("../domain/Phone/WebRTCPhone");
const web_rtc_client_1 = __importStar(require("../web-rtc-client"));
const IssueReporter_1 = __importDefault(require("../service/IssueReporter"));
const Emitter_1 = __importDefault(require("../utils/Emitter"));
const index_1 = __importDefault(require("./index"));
const SFUNotAvailableError_1 = __importDefault(require("../domain/SFUNotAvailableError"));
const logger = IssueReporter_1.default.loggerFor('simple-phone');
const sipLogger = IssueReporter_1.default.loggerFor('sip.js');
const protocolLogger = IssueReporter_1.default.loggerFor('sip');
const protocolDebugMessages = ['Received WebSocket text message:', 'Sending WebSocket message:'];
class Phone extends Emitter_1.default {
    constructor() {
        super();
        // Sugar syntax for `Wazo.Phone.EVENT_NAME`
        Object.keys(PHONE_EVENTS).forEach((key) => {
            // @ts-ignore
            this[key] = PHONE_EVENTS[key];
        });
        this.SessionState = session_state_1.SessionState;
    }
    connect(options = {}, sipLine = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.phone) {
                // Already connected
                // let's update media constraints if they're being fed
                if (options.media) {
                    this.phone.setMediaConstraints(options.media);
                }
                return;
            }
            const server = index_1.default.Auth.getHost();
            const session = index_1.default.Auth.getSession();
            if (!server || !session) {
                throw new Error('Please connect to the server using `Wazo.Auth.logIn` or `Wazo.Auth.authenticate` before using Room.connect().');
            }
            this.session = session;
            this.sipLine = sipLine || this.getPrimaryWebRtcLine();
            if (!this.sipLine) {
                throw new Error('Sorry, no sip lines found for this user');
            }
            this.connectWithCredentials(server, this.sipLine, session.displayName(), options);
        });
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
        if (IssueReporter_1.default.enabled) {
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
        this.client = new web_rtc_client_1.default(Object.assign({ host, port: typeof port === 'string' ? parseInt(port, 10) : port, displayName, authorizationUser: sipLine.username, password: sipLine.secret, uri: `${sipLine.username}@${server}` }, options), null, options.uaConfigOverrides);
        this.phone = new WebRTCPhone_1.default(this.client, options.audioDeviceOutput, true, options.audioDeviceRing);
        this._transferEvents();
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.phone) {
                if (this.phone.hasAnActiveCall()) {
                    logger.info('hangup call on disconnect');
                    yield this.phone.hangup(null);
                }
                yield this.phone.close();
            }
            this.phone = null;
        });
    }
    // If audioOnly is set to true, all video stream will be deactivated, even remotes ones.
    call(extension, withCamera = false, rawSipLine = null, audioOnly = false, conference = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.phone) {
                return;
            }
            const sipLine = rawSipLine || this.getPrimaryWebRtcLine();
            return this.phone.makeCall(extension, sipLine, withCamera, audioOnly, conference);
        });
    }
    hangup(callSession) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('hangup via simple phone', {
                callId: callSession.getId(),
            });
            return this.phone ? this.phone.hangup(callSession) : false;
        });
    }
    accept(callSession, cameraEnabled) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('accept via simple phone', {
                callId: callSession.getId(),
                cameraEnabled,
            });
            return this.phone ? this.phone.accept(callSession, cameraEnabled) : null;
        });
    }
    startConference(host, otherCalls) {
        return __awaiter(this, void 0, void 0, function* () {
            const participants = [host, ...otherCalls].reduce((acc, participant) => {
                acc[participant.getTalkingToIds()[0]] = participant;
                return acc;
            }, {});
            if (!this.phone) {
                return Promise.reject();
            }
            const adHocConference = new AdHocAPIConference_1.default({
                phone: this.phone,
                host,
                participants,
            });
            return adHocConference.start();
        });
    }
    mute(callSession, withApi = true) {
        var _a;
        if (withApi) {
            this.muteViaAPI(callSession);
        }
        (_a = this.phone) === null || _a === void 0 ? void 0 : _a.mute(callSession);
    }
    unmute(callSession, withApi = true) {
        var _a;
        if (withApi) {
            this.unmuteViaAPI(callSession);
        }
        (_a = this.phone) === null || _a === void 0 ? void 0 : _a.unmute(callSession);
    }
    muteViaAPI(callSession) {
        if (callSession && callSession.callId) {
            index_1.default.getApiClient().calld.mute(callSession.callId).catch(e => {
                logger.error('Mute via API, error', e);
            });
        }
    }
    unmuteViaAPI(callSession) {
        if (callSession && callSession.callId) {
            index_1.default.getApiClient().calld.unmute(callSession.callId).catch(e => {
                logger.error('Unmute via API, error', e);
            });
        }
    }
    hold(callSession) {
        var _a;
        return (_a = this.phone) === null || _a === void 0 ? void 0 : _a.hold(callSession, true);
    }
    unhold(callSession) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return (_a = this.phone) === null || _a === void 0 ? void 0 : _a.unhold(callSession, true);
        });
    }
    resume(callSession) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = this.phone) === null || _a === void 0 ? void 0 : _a.resume(callSession)) || null;
        });
    }
    reject(callSession) {
        var _a;
        return (_a = this.phone) === null || _a === void 0 ? void 0 : _a.reject(callSession);
    }
    transfer(callSession, target) {
        var _a;
        (_a = this.phone) === null || _a === void 0 ? void 0 : _a.transfer(callSession, target);
    }
    atxfer(callSession) {
        var _a;
        return ((_a = this.phone) === null || _a === void 0 ? void 0 : _a.atxfer(callSession)) || null;
    }
    reinvite(callSession, constraints = null, conference = false) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.phone ? this.phone.sendReinvite(callSession, constraints, conference) : null;
        });
    }
    getStats(callSession) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.phone ? this.phone.getStats(callSession) : null;
        });
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
            type: WebRTCPhone_2.MESSAGE_TYPE_CHAT,
            content,
        }), sipSession, 'application/json');
    }
    sendSignal(content, sipSession) {
        this.sendMessage(JSON.stringify({
            type: WebRTCPhone_2.MESSAGE_TYPE_SIGNAL,
            content,
        }), sipSession, 'application/json');
    }
    turnCameraOff(callSession) {
        var _a;
        (_a = this.phone) === null || _a === void 0 ? void 0 : _a.turnCameraOff(callSession);
    }
    turnCameraOn(callSession) {
        var _a;
        (_a = this.phone) === null || _a === void 0 ? void 0 : _a.turnCameraOn(callSession);
    }
    startScreenSharing(constraints, callSession) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return ((_a = this.phone) === null || _a === void 0 ? void 0 : _a.startScreenSharing(constraints, callSession)) || null;
        });
    }
    stopScreenSharing(callSession, restoreLocalStream = true) {
        return this.phone ? this.phone.stopScreenSharing(restoreLocalStream, callSession) : Promise.resolve();
    }
    sendDTMF(tone, callSession) {
        var _a;
        (_a = this.phone) === null || _a === void 0 ? void 0 : _a.sendKey(callSession, tone);
    }
    getLocalStream(callSession) {
        var _a;
        return (_a = this.phone) === null || _a === void 0 ? void 0 : _a.getLocalStream(callSession);
    }
    hasLocalVideo(callSession) {
        var _a;
        return ((_a = this.phone) === null || _a === void 0 ? void 0 : _a.hasLocalVideo(callSession)) || false;
    }
    hasALocalVideoTrack(callSession) {
        var _a;
        return ((_a = this.phone) === null || _a === void 0 ? void 0 : _a.hasALocalVideoTrack(callSession)) || false;
    }
    // @Deprecated
    getLocalMediaStream(callSession) {
        var _a;
        logger.warn('Phone.getLocalMediaStream is deprecated, use Phone.getLocalStream instead');
        return (_a = this.phone) === null || _a === void 0 ? void 0 : _a.getLocalStream(callSession);
    }
    getLocalVideoStream(callSession) {
        var _a;
        return ((_a = this.phone) === null || _a === void 0 ? void 0 : _a.getLocalVideoStream(callSession)) || null;
    }
    getRemoteStream(callSession) {
        var _a;
        return ((_a = this.phone) === null || _a === void 0 ? void 0 : _a.getRemoteStream(callSession)) || null;
    }
    getRemoteVideoStream(callSession) {
        var _a;
        return ((_a = this.phone) === null || _a === void 0 ? void 0 : _a.getRemoteVideoStream(callSession)) || null;
    }
    isVideoRemotelyHeld(callSession) {
        var _a;
        return ((_a = this.phone) === null || _a === void 0 ? void 0 : _a.isVideoRemotelyHeld(callSession)) || false;
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
        var _a;
        return ((_a = this.phone) === null || _a === void 0 ? void 0 : _a.getRemoteVideoStreamFromPc(callSession)) || null;
    }
    hasVideo(callSession) {
        return this.phone ? this.phone.hasVideo(callSession) : false;
    }
    hasAVideoTrack(callSession) {
        return this.phone ? this.phone.hasAVideoTrack(callSession) : false;
    }
    getCurrentSipSession() {
        var _a;
        return ((_a = this.phone) === null || _a === void 0 ? void 0 : _a.currentSipSession) || null;
    }
    getPrimaryWebRtcLine() {
        const session = index_1.default.Auth.getSession();
        return (session === null || session === void 0 ? void 0 : session.primaryWebRtcLine()) || null;
    }
    getOutputDevice() {
        var _a;
        return ((_a = this.phone) === null || _a === void 0 ? void 0 : _a.audioOutputDeviceId) || null;
    }
    getPrimaryLine() {
        const session = index_1.default.Auth.getSession();
        return (session === null || session === void 0 ? void 0 : session.primarySipLine()) || null;
    }
    getLineById(lineId) {
        return this.getSipLines().find(line => line && line.id === lineId) || null;
    }
    getSipLines() {
        var _a;
        const session = index_1.default.Auth.getSession();
        if (!session) {
            return [];
        }
        return ((_a = session.profile) === null || _a === void 0 ? void 0 : _a.sipLines) || [];
    }
    hasSfu() {
        var _a;
        return ((_a = this.sipLine) === null || _a === void 0 ? void 0 : _a.hasVideoConference()) || false;
    }
    checkSfu() {
        if (!this.hasSfu()) {
            throw new SFUNotAvailableError_1.default();
        }
    }
    _transferEvents() {
        this.unbind();
        [...web_rtc_client_1.events, ...web_rtc_client_1.transportEvents].forEach(event => {
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
exports.default = global.wazoTelephonyInstance;
