"use strict";
/* eslint-disable class-methods-use-this, no-param-reassign, max-classes-per-file, no-underscore-dangle */
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanceledCallError = exports.transportEvents = exports.events = exports.replaceLocalIpModifier = void 0;
/* global window, document, navigator */
require("webrtc-adapter");
const user_agent_state_1 = require("sip.js/lib/api/user-agent-state");
const parser_1 = require("sip.js/lib/core/messages/parser");
const constants_1 = require("sip.js/lib/core/messages/methods/constants");
const uri_1 = require("sip.js/lib/grammar/uri");
const user_agent_1 = require("sip.js/lib/api/user-agent");
const modifiers_1 = require("sip.js/lib/platform/web/modifiers/modifiers");
const messager_1 = require("sip.js/lib/api/messager");
const registerer_state_1 = require("sip.js/lib/api/registerer-state");
const session_state_1 = require("sip.js/lib/api/session-state");
const transport_state_1 = require("sip.js/lib/api/transport-state");
const peer_connection_configuration_default_1 = require("sip.js/lib/platform/web/session-description-handler/peer-connection-configuration-default");
const getstats_1 = __importDefault(require("getstats"));
const api_1 = require("sip.js/lib/api");
const WazoSessionDescriptionHandler_1 = __importStar(require("./lib/WazoSessionDescriptionHandler"));
const Emitter_1 = __importDefault(require("./utils/Emitter"));
const api_client_1 = __importDefault(require("./api-client"));
const IssueReporter_1 = __importDefault(require("./service/IssueReporter"));
const Heartbeat_1 = __importDefault(require("./utils/Heartbeat"));
const sdp_1 = require("./utils/sdp");
const array_1 = require("./utils/array");
// We need to replace 0.0.0.0 to 127.0.0.1 in the sdp to avoid MOH during a createOffer.
const replaceLocalIpModifier = (description) => Promise.resolve(Object.assign(Object.assign({}, JSON.parse(JSON.stringify(description))), { sdp: description.sdp.replace('c=IN IP4 0.0.0.0', 'c=IN IP4 127.0.0.1') }));
exports.replaceLocalIpModifier = replaceLocalIpModifier;
const SIP_ID_LENGTH = 36;
const DEFAULT_ICE_TIMEOUT = 3000;
const SEND_STATS_DELAY = 5000;
const states = ['STATUS_NULL', 'STATUS_NEW', 'STATUS_CONNECTING', 'STATUS_CONNECTED', 'STATUS_COMPLETED'];
const logger = IssueReporter_1.default ? IssueReporter_1.default.loggerFor('webrtc-client') : console;
const statsLogger = IssueReporter_1.default ? IssueReporter_1.default.loggerFor('webrtc-stats') : console;
// events
const REGISTERED = 'registered';
const UNREGISTERED = 'unregistered';
const REGISTRATION_FAILED = 'registrationFailed';
const INVITE = 'invite';
const CONNECTED = 'connected';
const DISCONNECTED = 'disconnected';
const TRANSPORT_ERROR = 'transportError';
const MESSAGE = 'message';
const ACCEPTED = 'accepted';
const REJECTED = 'rejected';
const ON_TRACK = 'onTrack';
const ON_EARLY_MEDIA = 'onEarlyMedia';
const ON_REINVITE = 'reinvite';
const ON_ERROR = 'onError';
const ON_SCREEN_SHARING_REINVITE = 'onScreenSharingReinvite';
const ON_NETWORK_STATS = 'onNetworkStats';
const ON_DISCONNECTED = 'onDisconnected';
exports.events = [REGISTERED, UNREGISTERED, REGISTRATION_FAILED, INVITE];
exports.transportEvents = [CONNECTED, DISCONNECTED, TRANSPORT_ERROR, MESSAGE];
class CanceledCallError extends Error {
}
exports.CanceledCallError = CanceledCallError;
const MAX_REGISTER_TRIES = 5;
class WebRTCClient extends Emitter_1.default {
    static isAPrivateIp(ip) {
        const regex = /^(?:10|127|172\.(?:1[6-9]|2[0-9]|3[01])|192\.168)\..*/;
        return regex.exec(ip) == null;
    }
    static getIceServers(ip) {
        if (WebRTCClient.isAPrivateIp(ip)) {
            return [{
                    urls: ['stun:stun.l.google.com:19302', 'stun:stun4.l.google.com:19302'],
                }];
        }
        return [];
    }
    constructor(config, session, uaConfigOverrides = undefined) {
        super();
        this.uaConfigOverrides = uaConfigOverrides;
        this.config = config;
        this.skipRegister = config.skipRegister;
        this._buildConfig(config, session).then((newConfig) => {
            this.config = newConfig;
            this.userAgent = this.createUserAgent(uaConfigOverrides);
        });
        this.audioOutputDeviceId = config.audioOutputDeviceId;
        this.audioOutputVolume = config.audioOutputVolume || 1;
        if (config.media) {
            this.configureMedia(config.media);
            this.setMediaConstraints({
                audio: config.media.audio,
                video: config.media.video,
            });
        }
        this.heldSessions = {};
        this.statsIntervals = {};
        this.connectionPromise = null;
        this.sipSessions = {};
        this.conferences = {};
        this.networkMonitoringInterval = {};
        this.sessionNetworkStats = {};
        this.forceClosed = false;
        this._boundOnHeartbeat = this._onHeartbeat.bind(this);
        this.heartbeat = new Heartbeat_1.default(config.heartbeatDelay, config.heartbeatTimeout, config.maxHeartbeats);
        this.heartbeat.setSendHeartbeat(this.pingServer.bind(this));
        this.heartbeat.setOnHeartbeatTimeout(this._onHeartbeatTimeout.bind(this));
        // sugar
        this.REGISTERED = REGISTERED;
        this.UNREGISTERED = UNREGISTERED;
        this.REGISTRATION_FAILED = REGISTRATION_FAILED;
        this.INVITE = INVITE;
        this.CONNECTED = CONNECTED;
        this.DISCONNECTED = DISCONNECTED;
        this.TRANSPORT_ERROR = TRANSPORT_ERROR;
        this.MESSAGE = MESSAGE;
        this.ACCEPTED = ACCEPTED;
        this.REJECTED = REJECTED;
        this.ON_TRACK = ON_TRACK;
        this.ON_REINVITE = ON_REINVITE;
        this.ON_ERROR = ON_ERROR;
        this.ON_SCREEN_SHARING_REINVITE = ON_SCREEN_SHARING_REINVITE;
        this.ON_NETWORK_STATS = ON_NETWORK_STATS;
        this.ON_DISCONNECTED = ON_DISCONNECTED;
        this.ON_EARLY_MEDIA = ON_EARLY_MEDIA;
    }
    configureMedia(media) {
        this.hasAudio = !!media.audio;
        this.audioStreams = {};
        this.audioElements = {};
    }
    setMediaConstraints(media) {
        this.video = media.video;
        this.audio = media.audio;
    }
    createUserAgent(configOverrides) {
        const webRTCConfiguration = this._createWebRTCConfiguration(configOverrides);
        logger.info('sdk webrtc, creating UA', {
            webRTCConfiguration,
        });
        webRTCConfiguration.delegate = {
            onConnect: this.onConnect.bind(this),
            onDisconnect: this.onDisconnect.bind(this),
            onInvite: (invitation) => {
                logger.info('sdk webrtc on invite', {
                    method: 'delegate.onInvite',
                    id: invitation.id,
                    // @ts-ignore
                    remoteURI: invitation.remoteURI,
                });
                this._setupSession(invitation);
                const shouldAutoAnswer = !!invitation.request.getHeader('alert-info');
                this.eventEmitter.emit(INVITE, invitation, this.sessionWantsToDoVideo(invitation), shouldAutoAnswer);
            },
        };
        const ua = new user_agent_1.UserAgent(webRTCConfiguration);
        if (ua.transport && ua.transport.connectPromise) {
            ua.transport.connectPromise.catch((e) => {
                logger.warn('Transport connect error', e);
            });
        }
        ua.transport.onMessage = (rawMessage) => {
            const message = parser_1.Parser.parseMessage(rawMessage, ua.transport.logger);
            // We have to re-sent the message to the UA ...
            ua.onTransportMessage(rawMessage);
            // And now do what we want with the message
            this.eventEmitter.emit(MESSAGE, message);
            if (message && message.method === constants_1.C.MESSAGE) {
                // We have to manually reply to MESSAGE with a 200 OK or Asterisk will hangup.
                ua.userAgentCore.replyStateless(message, {
                    statusCode: 200,
                });
            }
        };
        return ua;
    }
    isConnected() {
        var _a;
        return Boolean((_a = this.userAgent) === null || _a === void 0 ? void 0 : _a.isConnected());
    }
    isConnecting() {
        var _a, _b;
        return ((_b = (_a = this.userAgent) === null || _a === void 0 ? void 0 : _a.transport) === null || _b === void 0 ? void 0 : _b.state) === transport_state_1.TransportState.Connecting;
    }
    isRegistered() {
        return Boolean(this.registerer && this.registerer.state === registerer_state_1.RegistererState.Registered);
    }
    onConnect() {
        var _a;
        logger.info('sdk webrtc connected', {
            method: 'delegate.onConnect',
        });
        this.eventEmitter.emit(CONNECTED);
        // @ts-ignore
        if (!this.isRegistered() && ((_a = this.registerer) === null || _a === void 0 ? void 0 : _a.waiting)) {
            // @ts-ignore
            this.registerer.waitingToggle(false);
        }
        return this.register();
    }
    onDisconnect(error) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('sdk webrtc disconnected', {
                method: 'delegate.onConnect',
                error,
            });
            this.connectionPromise = null;
            // The UA will attempt to reconnect automatically when an error occurred
            this.eventEmitter.emit(DISCONNECTED, error);
            if (this.isRegistered()) {
                yield this.unregister();
                // @ts-ignore
                if ((_a = this.registerer) === null || _a === void 0 ? void 0 : _a.waiting) {
                    // @ts-ignore
                    this.registerer.waitingToggle(false);
                }
                this.eventEmitter.emit(UNREGISTERED);
            }
        });
    }
    register(tries = 0) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const logInfo = {
                userAgent: !!this.userAgent,
                registered: this.isRegistered(),
                connectionPromise: !!this.connectionPromise,
                registerer: !!this.registerer,
                // @ts-ignore
                waiting: this.registerer && this.registerer.waiting,
                tries,
                skipRegister: this.skipRegister,
            };
            this.forceClosed = false;
            if (this.skipRegister) {
                logger.info('sdk webrtc skip register...', logInfo);
                return Promise.resolve();
            }
            logger.info('sdk webrtc registering...', logInfo);
            if (!this.userAgent) {
                logger.info('sdk webrtc recreating User Agent');
                this.userAgent = this.createUserAgent(this.uaConfigOverrides);
            }
            if (!this.userAgent || this.isRegistered()) {
                logger.info('sdk webrtc registering aborted, already registered or no UA can be created');
                return Promise.resolve();
            }
            // @ts-ignore
            if (this.connectionPromise || ((_a = this.registerer) === null || _a === void 0 ? void 0 : _a.waiting)) {
                logger.info('sdk webrtc registering aborted due to a registration in progress.');
                return Promise.resolve();
            }
            const registerOptions = this._isWeb() ? {} : {
                extraContactHeaderParams: ['mobility=mobile'],
            };
            const onRegisterFailed = () => {
                logger.info('sdk webrtc registering failed', {
                    tries,
                    registerer: !!this.registerer,
                    forceClosed: this.forceClosed,
                });
                if (this.forceClosed) {
                    return;
                }
                this.connectionPromise = null;
                // @ts-ignore
                if (this.registerer && this.registerer.waiting) {
                    // @ts-ignore
                    this.registerer.waitingToggle(false);
                }
                if (tries <= MAX_REGISTER_TRIES) {
                    logger.info('sdk webrtc registering, retrying...', {
                        tries,
                    });
                    setTimeout(() => this.register(tries + 1), 300);
                }
            };
            return this._connectIfNeeded().then(() => {
                // Avoid race condition with the close method called just before register and setting userAgent to null
                // during the resolution of the primise.
                if (!this.userAgent) {
                    logger.info('sdk webrtc recreating User Agent after connection');
                    this.userAgent = this.createUserAgent(this.uaConfigOverrides);
                }
                logger.info('sdk webrtc registering, transport connected', {
                    registerOptions,
                    ua: !!this.userAgent,
                });
                this.registerer = new api_1.Registerer(this.userAgent, registerOptions);
                this.connectionPromise = null;
                this._monkeyPatchRegisterer(this.registerer);
                // Bind registerer events
                this.registerer.stateChange.addListener(newState => {
                    logger.info('sdk webrtc registering, state changed', {
                        newState,
                    });
                    if (newState === registerer_state_1.RegistererState.Registered && this.registerer && this.registerer.state === registerer_state_1.RegistererState.Registered) {
                        this.eventEmitter.emit(REGISTERED);
                    }
                    else if (newState === registerer_state_1.RegistererState.Unregistered) {
                        this.eventEmitter.emit(UNREGISTERED);
                    }
                });
                const options = {
                    requestDelegate: {
                        onReject: (response) => {
                            logger.error('sdk webrtc registering, rejected', {
                                response,
                            });
                            onRegisterFailed();
                        },
                    },
                };
                return this.registerer.register(options).catch(e => {
                    logger.error('sdk webrtc registering, error', e);
                    this.eventEmitter.emit(REGISTRATION_FAILED);
                    return e;
                });
            }).catch(error => {
                logger.error('sdk webrtc registering, transport error', error);
                onRegisterFailed();
            });
        });
    }
    // Monkey patching sip.js to avoid issues during register.onReject
    _monkeyPatchRegisterer(registerer) {
        if (!registerer) {
            return;
        }
        // @ts-ignore
        const oldWaitingToggle = registerer.waitingToggle.bind(registerer);
        // @ts-ignore
        const oldUnregistered = registerer.unregistered.bind(registerer);
        // @ts-ignore
        registerer.waitingToggle = (waiting) => {
            // @ts-ignore
            if (!registerer || registerer.waiting === waiting) {
                return;
            }
            oldWaitingToggle(waiting);
        };
        // @ts-ignore
        registerer.unregistered = () => {
            if (!registerer || registerer.state === registerer_state_1.RegistererState.Terminated) {
                return;
            }
            oldUnregistered();
        };
    }
    unregister() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('sdk webrtc unregistering..', {
                userAgent: !!this.userAgent,
                registerer: !!this.registerer,
            });
            if (!this.registerer) {
                return Promise.resolve();
            }
            try {
                return this.registerer.unregister().then(() => {
                    logger.info('sdk webrtc unregistered');
                    this._cleanupRegister();
                }).catch(e => {
                    logger.error('sdk webrtc unregistering, promise error', e);
                    this._cleanupRegister();
                });
            }
            catch (e) {
                logger.error('sdk webrtc unregistering, error', e);
                // Avoid issue with `undefined is not an object (evaluating 'new.target.prototype')` when triggering a new
                // error when the registerer is in a bad state
                this._cleanupRegister();
            }
        });
    }
    stop() {
        logger.info('sdk webrtc stop', {
            userAgent: !!this.userAgent,
        });
        if (!this.userAgent) {
            return Promise.resolve();
        }
        return this.userAgent.stop().then(() => {
            return this._cleanupRegister();
        }).catch(e => {
            logger.warn('sdk webrtc stop, error', {
                message: e.message,
                stack: e.stack,
            });
        });
    }
    call(number, enableVideo, audioOnly = false, conference = false) {
        logger.info('sdk webrtc creating call', {
            number,
            enableVideo,
            audioOnly,
            conference,
        });
        const inviterOptions = {
            sessionDescriptionHandlerOptionsReInvite: {
                conference,
                audioOnly,
            },
            earlyMedia: true,
        };
        if (audioOnly) {
            inviterOptions.sessionDescriptionHandlerModifiersReInvite = [modifiers_1.stripVideo];
        }
        const uri = this._makeURI(number);
        let session;
        if (uri) {
            session = this.userAgent ? new api_1.Inviter(this.userAgent, uri, inviterOptions) : null;
        }
        else {
            logger.error('Null URI');
        }
        if (session) {
            this.storeSipSession(session);
            this._setupSession(session);
        }
        if (conference) {
            this.conferences[this.getSipSessionId(session)] = true;
        }
        const inviteOptions = {
            requestDelegate: {
                onAccept: (response) => {
                    var _a;
                    // @ts-ignore
                    if ((_a = session.sessionDescriptionHandler) === null || _a === void 0 ? void 0 : _a.peerConnection) {
                        // @ts-ignore
                        session.sessionDescriptionHandler.peerConnection.sfu = conference;
                    }
                    // @ts-ignore
                    this._onAccepted(session, response.session, true);
                },
                onProgress: payload => {
                    if (payload.message.statusCode === 183) {
                        // @ts-ignore
                        this._onEarlyProgress(payload.session);
                    }
                },
                onReject: (response) => {
                    logger.info('on call rejected', {
                        id: session.id,
                        // @ts-ignore
                        fromTag: session.fromTag,
                    });
                    this._stopSendingStats(session);
                    this.stopNetworkMonitoring(session);
                    this.eventEmitter.emit(REJECTED, session, response);
                },
            },
            sessionDescriptionHandlerOptions: this.getMediaConfiguration(enableVideo || false, conference),
        };
        if (inviteOptions.sessionDescriptionHandlerOptions) {
            // @ts-ignore
            inviteOptions.sessionDescriptionHandlerOptions.audioOnly = audioOnly;
        }
        inviteOptions.sessionDescriptionHandlerModifiers = [exports.replaceLocalIpModifier];
        if (audioOnly) {
            inviteOptions.sessionDescriptionHandlerModifiers.push(modifiers_1.stripVideo);
        }
        // Do not await invite here or we'll miss the Establishing state transition
        session.invitePromise = session.invite(inviteOptions);
        return session;
    }
    answer(session, enableVideo) {
        logger.info('sdk webrtc answer call', {
            id: session.id,
            enableVideo,
        });
        if (!session || !session.accept) {
            const error = 'No session to answer, or not an invitation';
            logger.warn(error);
            return Promise.reject(new Error(error));
        }
        const options = {
            sessionDescriptionHandlerOptions: this.getMediaConfiguration(enableVideo || false),
        };
        return session.accept(options).then(() => {
            // @ts-ignore
            if (session.isCanceled) {
                const message = 'accepted a canceled session (or was canceled during the accept phase).';
                logger.error(message, {
                    id: session.id,
                });
                this.onCallEnded(session);
                throw new CanceledCallError(message);
            }
            logger.info('sdk webrtc answer, accepted.');
            this._onAccepted(session);
        }).catch(e => {
            logger.error(`answer call error for ${session ? session.id : 'n/a'}`, e);
            throw e;
        });
    }
    hangup(session) {
        return __awaiter(this, void 0, void 0, function* () {
            const { state, id, } = session;
            logger.info('sdk webrtc hangup call', {
                id,
                state,
            });
            try {
                this._stopSendingStats(session);
                this._cleanupMedia(session);
                delete this.sipSessions[this.getSipSessionId(session)];
                // Check if Invitation or Inviter (Invitation = incoming call)
                const isInviter = session instanceof api_1.Inviter;
                const cancel = () => session.cancel();
                const reject = () => session.reject();
                const bye = () => session.bye && session.bye();
                // @see github.com/onsip/SIP.js/blob/f11dfd584bc9788ccfc94e03034020672b738975/src/platform/web/simple-user/simple-user.ts#L1004
                const actions = {
                    [session_state_1.SessionState.Initial]: isInviter ? cancel : reject,
                    [session_state_1.SessionState.Establishing]: isInviter ? cancel : reject,
                    [session_state_1.SessionState.Established]: bye,
                };
                // Handle different session status
                if (actions[state]) {
                    return yield actions[state]();
                }
                return yield bye();
            }
            catch (error) {
                logger.warn('sdk webrtc hangup, error', error);
            }
            return Promise.resolve(null);
        });
    }
    getStats(session) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const pc = session.sessionDescriptionHandler.peerConnection;
            if (!pc) {
                return null;
            }
            return pc.getStats(null);
        });
    }
    // Fetch and emit an event at `interval` with session network stats
    startNetworkMonitoring(session, interval = 1000) {
        const sessionId = this.getSipSessionId(session);
        logger.info('starting network inspection', {
            id: sessionId,
        });
        this.sessionNetworkStats[sessionId] = [];
        this.networkMonitoringInterval[sessionId] = setInterval(() => this._fetchNetworkStats(sessionId), interval);
    }
    stopNetworkMonitoring(session) {
        const sessionId = this.getSipSessionId(session);
        const exists = (sessionId in this.networkMonitoringInterval);
        logger.info('stopping network inspection', {
            id: sessionId,
            exists,
        });
        if (exists) {
            clearInterval(this.networkMonitoringInterval[sessionId]);
            delete this.networkMonitoringInterval[sessionId];
            delete this.sessionNetworkStats[sessionId];
        }
    }
    reject(session) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('sdk webrtc reject call', {
                id: session.id,
            });
            try {
                if (session instanceof api_1.Invitation) {
                    return session.reject();
                }
                if (session instanceof api_1.Inviter) {
                    return session.cancel();
                }
            }
            catch (e) {
                logger.warn('Error when rejecting call', e.message, e.stack);
            }
        });
    }
    close(force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('sdk webrtc closing client', {
                userAgent: !!this.userAgent,
                force,
            });
            this.forceClosed = force;
            this._cleanupMedia();
            this.connectionPromise = null;
            Object.values(this.audioElements).forEach((audioElement) => {
                // eslint-disable-next-line
                audioElement.srcObject = null;
                audioElement.pause();
            });
            this.audioElements = {};
            if (!this.userAgent) {
                return;
            }
            this.stopHeartbeat();
            if (this.userAgent) {
                this.userAgent.delegate = undefined;
            }
            // @ts-ignore: this is odd, may want to validate
            this.userAgent.stateChange.removeAllListeners();
            yield this._disconnectTransport(force);
            this._cleanupRegister();
            try {
                // Don't wait here, It can take ~30s to stop ...
                this.userAgent.stop().catch(console.error);
            }
            catch (_) { // Avoid to raise exception when trying to close with hanged-up sessions remaining
                // eg: "INVITE not rejectable in state Completed"
            }
            this.userAgent = null;
            logger.info('sdk webrtc client closed');
        });
    }
    getNumber(session) {
        if (!session) {
            return null;
        }
        // @ts-ignore
        return session.remoteIdentity.uri._normal.user;
    }
    mute(session) {
        logger.info('sdk webrtc mute', {
            id: session.id,
        });
        this._toggleAudio(session, true);
    }
    unmute(session) {
        logger.info('sdk webrtc unmute', {
            id: session.id,
        });
        this._toggleAudio(session, false);
    }
    isAudioMuted(session) {
        if (!session || !session.sessionDescriptionHandler) {
            return false;
        }
        let muted = true;
        // @ts-ignore
        const pc = session.sessionDescriptionHandler.peerConnection;
        if (!pc) {
            return false;
        }
        if (pc.getSenders) {
            if (!pc.getSenders().length) {
                return false;
            }
            pc.getSenders().forEach((sender) => {
                if (sender && sender.track && sender.track.kind === 'audio') {
                    muted = muted && !sender.track.enabled;
                }
            });
        }
        else {
            if (!pc.getLocalStreams().length) {
                return false;
            }
            pc.getLocalStreams().forEach((stream) => {
                stream.getAudioTracks().forEach(track => {
                    muted = muted && !track.enabled;
                });
            });
        }
        return muted;
    }
    toggleCameraOn(session) {
        logger.info('sdk webrtc toggle camera on', {
            id: session.id,
        });
        this._toggleVideo(session, false);
    }
    toggleCameraOff(session) {
        logger.info('sdk webrtc toggle camera off', {
            id: session.id,
        });
        this._toggleVideo(session, true);
    }
    hold(session, isConference = false, hadVideo = false) {
        const sessionId = this.getSipSessionId(session);
        const hasVideo = hadVideo || this.hasLocalVideo(sessionId);
        logger.info('sdk webrtc hold', {
            sessionId,
            keys: Object.keys(this.heldSessions),
            // @ts-ignore
            pendingReinvite: !!session.pendingReinvite,
            isConference,
            hasVideo,
        });
        if (sessionId in this.heldSessions) {
            return Promise.resolve();
        }
        // @ts-ignore
        if (session.pendingReinvite) {
            return Promise.resolve();
        }
        this.heldSessions[sessionId] = {
            hasVideo,
            isConference,
        };
        if (isConference) {
            this.mute(session);
        }
        session.sessionDescriptionHandlerOptionsReInvite = {
            // @ts-ignore
            hold: true,
            conference: isConference,
        };
        const options = this.getMediaConfiguration(false, isConference);
        if (!this._isWeb()) {
            options.sessionDescriptionHandlerModifiers = [modifiers_1.holdModifier];
        }
        options.sessionDescriptionHandlerOptions = {
            constraints: options.constraints,
            hold: true,
            conference: isConference,
        };
        // Avoid sdh to create a new stream
        if (session.sessionDescriptionHandler) {
            // @ts-ignore
            session.sessionDescriptionHandler.localMediaStreamConstraints = options.constraints;
        }
        // Send re-INVITE
        return session.invite(options);
    }
    unhold(session, isConference = false) {
        const sessionId = this.getSipSessionId(session);
        const hasVideo = sessionId in this.heldSessions && this.heldSessions[sessionId].hasVideo;
        logger.info('sdk webrtc unhold', {
            sessionId,
            keys: Object.keys(this.heldSessions),
            // @ts-ignore
            pendingReinvite: !!session.pendingReinvite,
            isConference,
            hasVideo,
        });
        // @ts-ignore
        if (session.pendingReinvite) {
            return Promise.resolve();
        }
        if (isConference) {
            this.unmute(session);
        }
        delete this.heldSessions[this.getSipSessionId(session)];
        session.sessionDescriptionHandlerOptionsReInvite = {
            // @ts-ignore
            hold: false,
            conference: isConference,
        };
        const options = this.getMediaConfiguration(false, isConference);
        if (!this._isWeb()) {
            // We should sent an empty `sessionDescriptionHandlerModifiers` or sip.js will take the last sent modifiers
            // (eg: holdModifier)
            options.sessionDescriptionHandlerModifiers = [];
        }
        options.sessionDescriptionHandlerOptions = {
            constraints: options.constraints,
            hold: false,
            conference: isConference,
        };
        // Send re-INVITE
        return session.invite(options);
    }
    // Returns true if a re-INVITE is required
    upgradeToVideo(session, constraints, isConference) {
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            const pc = session.sessionDescriptionHandler.peerConnection;
            // Check if a video sender already exists
            let videoSender;
            if (isConference) {
                // We search for the last transceiver without `video-` in the mid (video- means remote transceiver)
                const transceivers = pc.getTransceivers();
                const transceiverIdx = (0, array_1.lastIndexOf)(transceivers, transceiver => transceiver.sender.track === null && transceiver.mid && transceiver.mid.indexOf('video') === -1);
                videoSender = transceiverIdx !== -1 ? transceivers[transceiverIdx].sender : null;
            }
            else {
                videoSender = pc && pc.getSenders && pc.getSenders().find((sender) => sender.track === null);
            }
            if (!videoSender) {
                // When no video sender found, it means that we're in the first video upgrade in 1:1
                return;
            }
            // Reuse bidirectional video stream
            const newStream = yield this.getStreamFromConstraints(constraints);
            if (!newStream) {
                console.warn(`Can't create media stream with: ${JSON.stringify(constraints || {})}`);
                return;
            }
            // Add previous local audio track
            if (constraints && !constraints.audio) {
                // @ts-ignore
                const localVideoStream = session.sessionDescriptionHandler.localMediaStream;
                const localAudioTrack = localVideoStream.getTracks().find(track => track.kind === 'audio');
                if (localAudioTrack) {
                    newStream.addTrack(localAudioTrack);
                }
            }
            const videoTrack = newStream.getVideoTracks()[0];
            if (videoTrack) {
                videoSender.replaceTrack(videoTrack);
            }
            this.setLocalMediaStream(this.getSipSessionId(session), newStream);
            return newStream;
        });
    }
    downgradeToAudio(session) {
        // Release local video stream when downgrading to audio
        // @ts-ignore
        const localStream = session.sessionDescriptionHandler.localMediaStream;
        // @ts-ignore
        const pc = session.sessionDescriptionHandler.peerConnection;
        const videoTracks = localStream.getVideoTracks();
        // Remove video senders
        if (pc.getSenders) {
            pc.getSenders().filter((sender) => sender.track && sender.track.kind === 'video').forEach((videoSender) => {
                videoSender.replaceTrack(null);
            });
        }
        videoTracks.forEach((videoTrack) => {
            videoTrack.enabled = false;
            videoTrack.stop();
            localStream.removeTrack(videoTrack);
        });
    }
    getStreamFromConstraints(constraints, conference = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const video = constraints && constraints.video;
            const { constraints: newConstraints, } = this.getMediaConfiguration(video, conference, constraints);
            let newStream;
            try {
                newStream = yield (0, WazoSessionDescriptionHandler_1.wazoMediaStreamFactory)(newConstraints);
            }
            catch (e) { // Nothing to do when the user cancel the screensharing prompt
            }
            if (!newStream) {
                return null;
            }
            // @ts-ignore
            newStream.local = true;
            return newStream;
        });
    }
    getHeldSession(sessionId) {
        return this.heldSessions[sessionId];
    }
    isCallHeld(session) {
        return this.getSipSessionId(session) in this.heldSessions;
    }
    isVideoRemotelyHeld(sessionId) {
        const pc = this.getPeerConnection(sessionId);
        const sdp = pc && pc.remoteDescription ? pc.remoteDescription.sdp : null;
        if (!sdp) {
            return false;
        }
        const videoDirection = (0, sdp_1.getVideoDirection)(sdp);
        return videoDirection === 'sendonly';
    }
    sendDTMF(session, tone) {
        if (!session.sessionDescriptionHandler) {
            return false;
        }
        logger.info('Sending DTMF', {
            id: this.getSipSessionId(session),
            tone,
        });
        return session.sessionDescriptionHandler.sendDtmf(tone);
    }
    message(destination, message) {
        const uri = this._makeURI(destination);
        if (!this.userAgent || !uri) {
            logger.warn('Null value on message', { uri, userAgent: this.userAgent });
            return;
        }
        const messager = new messager_1.Messager(this.userAgent, uri, message);
        messager.message();
    }
    transfer(session, target) {
        this.hold(session);
        logger.info('Transfering a session', {
            id: this.getSipSessionId(session),
            target,
        });
        const options = {
            requestDelegate: {
                onAccept: () => {
                    this.hangup(session);
                },
            },
        };
        setTimeout(() => {
            const uri = this._makeURI(target);
            if (!uri) {
                logger.warn('transfer timeout: null URI');
                return;
            }
            session.refer(uri, options);
        }, 50);
    }
    // check https://sipjs.com/api/0.12.0/refer/referClientContext/
    atxfer(session) {
        this.hold(session);
        logger.info('webrtc transfer started', {
            id: this.getSipSessionId(session),
        });
        const result = {
            newSession: null,
            init: (target) => __awaiter(this, void 0, void 0, function* () {
                logger.info('webrtc transfer initialized', {
                    id: this.getSipSessionId(session),
                    target,
                });
                result.newSession = yield this.call(target);
            }),
            complete: () => {
                logger.info('webrtc transfer completed', {
                    id: this.getSipSessionId(session),
                    referId: this.getSipSessionId(result.newSession),
                });
                session.refer(result.newSession);
            },
            cancel: () => {
                this.hangup(result.newSession);
                this.unhold(session);
            },
        };
        return result;
    }
    // eslint-disable-next-line @typescript-eslint/default-param-last
    sendMessage(sipSession = null, body, contentType = 'text/plain') {
        if (!sipSession) {
            return;
        }
        logger.info('send WebRTC message', {
            sipId: sipSession.id,
            contentType,
        });
        try {
            sipSession.message({
                requestOptions: {
                    body: {
                        content: body,
                        contentType,
                        // @HEADSUP: contentDisposition is a required string, setting it to '' arbitrarily
                        contentDisposition: '',
                    },
                },
            });
        }
        catch (e) {
            console.warn(e);
        }
    }
    pingServer() {
        var _a;
        if (!this.isConnected()) {
            return;
        }
        const core = (_a = this.userAgent) === null || _a === void 0 ? void 0 : _a.userAgentCore;
        const fromURI = this._makeURI(this.config.authorizationUser || '');
        const toURI = new uri_1.URI('sip', '', this.config.host);
        if (fromURI) {
            const message = core === null || core === void 0 ? void 0 : core.makeOutgoingRequestMessage('OPTIONS', toURI, fromURI, toURI, {});
            if (message) {
                return core === null || core === void 0 ? void 0 : core.request(message);
            }
            logger.warn('pingServer: null message');
        }
        logger.warn('pingServer: null fromURI');
    }
    getState() {
        // @ts-ignore
        return this.userAgent ? states[this.userAgent.state] : user_agent_state_1.UserAgentState.Stopped;
    }
    getContactIdentifier() {
        return this.userAgent ? `${this.userAgent.configuration.contactName}/${this.userAgent.contact.uri}` : null;
    }
    isFirefox() {
        return this._isWeb() && navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    }
    changeAudioOutputVolume(volume) {
        logger.info('Changing audio output volume', {
            volume,
        });
        Object.values(this.audioElements).forEach(audioElement => {
            if (audioElement instanceof HTMLAudioElement) {
                // eslint-disable-next-line no-param-reassign
                audioElement.volume = volume;
            }
        });
        this.audioOutputVolume = volume;
    }
    changeAudioOutputDevice(id) {
        logger.info('Changing audio output device', {
            id,
        });
        this.audioOutputDeviceId = id;
        Object.values(this.audioElements).forEach(audioElement => {
            // `setSinkId` method is not included in any flow type definitions for HTMLAudioElements but is a valid method
            // audioElement is an array of HTMLAudioElements, and HTMLAudioElement inherits the method from HTMLMediaElement
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLAudioElement
            // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/setSinkId
            // @ts-ignore
            if (audioElement.setSinkId) {
                // @ts-ignore
                audioElement.setSinkId(id);
            }
        });
    }
    changeAudioInputDevice(id, session, force) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentId = this.getAudioDeviceId();
            logger.info('setting audio input device', {
                id,
                currentId,
                session: !!session,
            });
            if (!force && id === currentId) {
                return null;
            }
            // in order to handle an audio track change for default devices
            // we need the actual id of the device (not 'default')
            let deviceId = id;
            if (id === 'default' && navigator.mediaDevices) {
                const devices = yield navigator.mediaDevices.enumerateDevices();
                const defaultDevice = devices.find(device => device.deviceId === 'default');
                if (defaultDevice) {
                    const deviceLabel = defaultDevice.label.replace('Default - ', '');
                    const targetDevice = devices.find(device => device.label === deviceLabel);
                    if (targetDevice) {
                        deviceId = targetDevice.deviceId;
                        if (!force && deviceId === currentId) {
                            return null;
                        }
                    }
                }
            }
            // let's update the local audio value
            if (this.audio) {
                this.audio = {
                    deviceId: {
                        exact: deviceId,
                    },
                };
            }
            if (session && navigator.mediaDevices) {
                const sdh = session.sessionDescriptionHandler;
                // @ts-ignore
                const pc = sdh.peerConnection;
                const constraints = {
                    audio: {
                        deviceId: {
                            exact: deviceId,
                        },
                    },
                };
                const stream = yield navigator.mediaDevices.getUserMedia(constraints);
                const audioTrack = stream.getAudioTracks()[0];
                const sender = pc && pc.getSenders && pc.getSenders().find((s) => audioTrack && s && s.track && s.track.kind === audioTrack.kind);
                if (sender) {
                    if (sender.track) {
                        audioTrack.enabled = sender.track.enabled;
                    }
                    sender.replaceTrack(audioTrack);
                }
                return stream;
            }
            return null;
        });
    }
    changeVideoInputDevice(id, session) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setVideoInputDevice(id);
            if (session) {
                return this.changeSessionVideoInputDevice(id, session);
            }
        });
    }
    setVideoInputDevice(id) {
        const currentId = this.getVideoDeviceId();
        logger.info('setting video input device', {
            id,
            currentId,
        });
        if (id === currentId) {
            return null;
        }
        // let's make sure we don't lose other video constraints settings -- width, height, frameRate...
        const videoObject = typeof this.video === 'object' ? this.video : {};
        this.video = Object.assign(Object.assign({}, videoObject), { deviceId: {
                exact: id,
            } });
    }
    changeSessionVideoInputDevice(id, session) {
        if (!this.sessionWantsToDoVideo(session)) {
            return Promise.resolve();
        }
        const sdh = session.sessionDescriptionHandler;
        // @ts-ignore
        const pc = sdh.peerConnection;
        const sessionId = this.getSipSessionId(session);
        const localStream = this.getLocalStream(sessionId);
        logger.info('changing video input device', {
            id,
            sessionId,
        });
        // Release old video stream
        if (localStream) {
            localStream.getVideoTracks().forEach(track => {
                track.stop();
            });
        }
        const constraints = {
            video: id ? {
                deviceId: {
                    exact: id,
                },
            } : true,
        };
        return navigator.mediaDevices.getUserMedia(constraints).then((stream) => __awaiter(this, void 0, void 0, function* () {
            const videoTrack = stream.getVideoTracks()[0];
            let sender = pc && pc.getSenders && pc.getSenders().find((s) => videoTrack && s && s.track && s.track.kind === videoTrack.kind);
            let wasTrackEnabled = false;
            if (!sender) {
                sender = pc && pc.getSenders && pc.getSenders().find((s) => !s.track);
            }
            if (sender) {
                // No video track means video not enabled
                wasTrackEnabled = sender.track ? sender.track.enabled : false;
                videoTrack.enabled = wasTrackEnabled;
                if (!wasTrackEnabled) {
                    videoTrack.stop();
                }
                sender.replaceTrack(wasTrackEnabled ? videoTrack : null);
            }
            // let's update the local stream
            this.eventEmitter.emit('onVideoInputChange', stream);
            this.setLocalMediaStream(sessionId, stream);
            return stream;
        }));
    }
    getAudioDeviceId() {
        // @ts-ignore
        return this.audio && typeof this.audio === 'object' && 'deviceId' in this.audio ? this.audio.deviceId.exact : undefined;
    }
    getVideoDeviceId() {
        // @ts-ignore
        return this.video && typeof this.video === 'object' && 'deviceId' in this.video ? this.video.deviceId.exact : undefined;
    }
    reinvite(sipSession, newConstraints = null, conference = false, audioOnly = false, iceRestart = false) {
        if (!sipSession) {
            return Promise.resolve();
        }
        // @ts-ignore
        if (sipSession.pendingReinvite) {
            return Promise.resolve();
        }
        const wasMuted = this.isAudioMuted(sipSession);
        const shouldDoVideo = newConstraints ? newConstraints.video : this.sessionWantsToDoVideo(sipSession);
        const shouldDoScreenSharing = newConstraints && newConstraints.screen;
        const desktop = newConstraints && newConstraints.desktop;
        logger.info('Sending reinvite', {
            id: this.getSipSessionId(sipSession),
            newConstraints,
            conference,
            audioOnly,
            wasMuted,
            shouldDoVideo,
            shouldDoScreenSharing,
            desktop,
        });
        // When upgrading to video, remove the `stripVideo` modifiers
        if (newConstraints && newConstraints.video) {
            const modifiers = sipSession.sessionDescriptionHandlerModifiersReInvite;
            sipSession.sessionDescriptionHandlerModifiersReInvite = modifiers.filter(modifier => modifier !== modifiers_1.stripVideo);
        }
        sipSession.sessionDescriptionHandlerOptionsReInvite = Object.assign(Object.assign({}, sipSession.sessionDescriptionHandlerOptionsReInvite), { 
            // @ts-ignore
            conference,
            audioOnly });
        const { constraints, } = this.getMediaConfiguration(shouldDoVideo, conference, newConstraints);
        return sipSession.invite({
            requestDelegate: {
                onAccept: (response) => {
                    // Update the SDP body to be able to call sessionWantsToDoVideo correctly in `_setup[Local|Remote]Media`.
                    // Can't set directly sipSession.body because it's a getter.
                    // @ts-ignore
                    if (sipSession instanceof api_1.Inviter && sipSession.outgoingRequestMessage.body) {
                        // @ts-ignore
                        sipSession.outgoingRequestMessage.body.body = response.message.body;
                    }
                    else if (sipSession instanceof api_1.Invitation) {
                        // @ts-ignore
                        sipSession.incomingInviteRequest.message.body = response.message.body;
                    }
                    logger.info('on re-INVITE accepted', {
                        id: this.getSipSessionId(sipSession),
                        wasMuted,
                        shouldDoScreenSharing,
                    });
                    this.updateRemoteStream(this.getSipSessionId(sipSession));
                    if (wasMuted) {
                        this.mute(sipSession);
                    }
                    // @ts-ignore
                    this._onAccepted(sipSession, response.session, false);
                    if (shouldDoScreenSharing) {
                        this.eventEmitter.emit(ON_SCREEN_SHARING_REINVITE, sipSession, response, desktop);
                    }
                    return this.eventEmitter.emit(ON_REINVITE, sipSession, response);
                },
            },
            sessionDescriptionHandlerModifiers: [exports.replaceLocalIpModifier],
            requestOptions: {
                extraHeaders: [
                    `Subject: ${shouldDoScreenSharing ? 'screenshare' : 'upgrade-video'}`,
                    `Ip: Mehdi.Emrani`,
                ],
            },
            sessionDescriptionHandlerOptions: {
                constraints,
                // @ts-ignore
                conference,
                audioOnly,
                offerOptions: {
                    iceRestart,
                },
            },
        });
    }
    getUserMedia(constraints) {
        return __awaiter(this, void 0, void 0, function* () {
            const newConstraints = {
                audio: this._getAudioConstraints(),
                video: this._getVideoConstraints(constraints.video),
            };
            return navigator.mediaDevices.getUserMedia(newConstraints);
        });
    }
    getPeerConnection(sessionId) {
        const sipSession = this.sipSessions[sessionId];
        if (!sipSession) {
            return null;
        }
        // @ts-ignore
        return sipSession.sessionDescriptionHandler ? sipSession.sessionDescriptionHandler.peerConnection : null;
    }
    // Local streams
    getLocalStream(sessionId) {
        var _a;
        const sipSession = this.sipSessions[sessionId];
        // @ts-ignore
        return ((_a = sipSession === null || sipSession === void 0 ? void 0 : sipSession.sessionDescriptionHandler) === null || _a === void 0 ? void 0 : _a.localMediaStream) || null;
    }
    getLocalTracks(sessionId) {
        const localStream = this.getLocalStream(sessionId);
        if (!localStream) {
            return [];
        }
        return localStream.getTracks();
    }
    hasLocalVideo(sessionId) {
        return this.getLocalTracks(sessionId).some(this._isVideoTrack);
    }
    // Check if we have at least one video track, even muted or not live
    hasALocalVideoTrack(sessionId) {
        return this.getLocalTracks(sessionId).some(track => track.kind === 'video');
    }
    getLocalVideoStream(sessionId) {
        return this.hasLocalVideo(sessionId) ? this.getLocalStream(sessionId) : null;
    }
    // Remote streams
    getRemoteStream(sessionId) {
        var _a;
        const sipSession = this.sipSessions[sessionId];
        // @ts-ignore
        return ((_a = sipSession === null || sipSession === void 0 ? void 0 : sipSession.sessionDescriptionHandler) === null || _a === void 0 ? void 0 : _a.remoteMediaStream) || null;
    }
    getRemoteTracks(sessionId) {
        const remoteStream = this.getRemoteStream(sessionId);
        if (!remoteStream) {
            return [];
        }
        return remoteStream.getTracks();
    }
    hasRemoteVideo(sessionId) {
        return this.getRemoteTracks(sessionId).some(this._isVideoTrack);
    }
    // Check if we have at least one video track, even muted or not live
    hasARemoteVideoTrack(sessionId) {
        return this.getRemoteTracks(sessionId).some(track => track.kind === 'video');
    }
    getRemoteVideoStream(sessionId) {
        if (this.isVideoRemotelyHeld(sessionId)) {
            return null;
        }
        return this.hasRemoteVideo(sessionId) ? this.getRemoteStream(sessionId) : null;
    }
    //  Useful in a react-native environment when remoteMediaStream is not updated
    getRemoteVideoStreamFromPc(sessionId) {
        const pc = this.getPeerConnection(sessionId);
        if (!pc) {
            return null;
        }
        return pc.getRemoteStreams().find((stream) => !!stream.getVideoTracks().length);
    }
    hasVideo(sessionId) {
        return this.hasLocalVideo(sessionId) || this.hasRemoteVideo(sessionId);
    }
    hasAVideoTrack(sessionId) {
        return this.hasALocalVideoTrack(sessionId) || this.hasARemoteVideoTrack(sessionId);
    }
    getSipSessionId(sipSession) {
        var _a;
        if (!sipSession) {
            return '';
        }
        // @ts-ignore
        if ((_a = sipSession.message) === null || _a === void 0 ? void 0 : _a.callId) {
            // @ts-ignore
            return sipSession.message.callId.substring(0, SIP_ID_LENGTH);
        }
        // For Inviter
        // @ts-ignore
        if (sipSession instanceof api_1.Inviter && sipSession.outgoingRequestMessage) {
            // @ts-ignore
            return sipSession.outgoingRequestMessage.callId.substring(0, SIP_ID_LENGTH);
        }
        // For Invitation
        return (sipSession.id || '').substring(0, SIP_ID_LENGTH);
    }
    waitForRegister() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => this.on(REGISTERED, resolve));
        });
    }
    // eslint-disable-next-line no-unused-vars
    sessionWantsToDoVideo(session) {
        if (!session) {
            return false;
        }
        const { body, } = session.request || session;
        // Sometimes with InviteClientContext the body is in the body attribute ...
        const sdp = typeof body === 'object' && body ? body.body : body;
        return (0, sdp_1.hasAnActiveVideo)(sdp);
    }
    hasHeartbeat() {
        return this.heartbeat.hasHeartbeat;
    }
    startHeartbeat() {
        logger.info('sdk webrtc start heartbeat', {
            userAgent: !!this.userAgent,
        });
        if (!this.userAgent) {
            this.heartbeat.stop();
            return;
        }
        this.eventEmitter.off(MESSAGE, this._boundOnHeartbeat);
        this.eventEmitter.on(MESSAGE, this._boundOnHeartbeat);
        this.heartbeat.start();
    }
    stopHeartbeat() {
        logger.info('sdk webrtc stop heartbeat');
        this.heartbeat.stop();
    }
    setOnHeartbeatTimeout(cb) {
        this.heartbeatTimeoutCb = cb;
    }
    setOnHeartbeatCallback(cb) {
        this.heartbeatCb = cb;
    }
    onCallEnded(session) {
        this._cleanupMedia(session);
        delete this.sipSessions[this.getSipSessionId(session)];
        this._stopSendingStats(session);
        this.stopNetworkMonitoring(session);
    }
    attemptReconnection() {
        logger.info('attempt reconnection', {
            userAgent: !!this.userAgent,
        });
        if (!this.userAgent) {
            return;
        }
        // @ts-ignore
        this.userAgent.attemptReconnection();
    }
    storeSipSession(session) {
        this.sipSessions[this.getSipSessionId(session)] = session;
    }
    getSipSession(id) {
        return id in this.sipSessions ? this.sipSessions[id.substring(0, SIP_ID_LENGTH)] : null;
    }
    getSipSessionIds() {
        return Object.keys(this.sipSessions);
    }
    setLocalMediaStream(sipSessionId, newStream) {
        const sipSession = this.sipSessions[sipSessionId];
        if (!sipSession) {
            return;
        }
        logger.info('setting local media stream', {
            sipSessionId,
            tracks: newStream ? newStream.getTracks() : null,
        });
        if (sipSession.sessionDescriptionHandler) {
            // eslint-disable-next-line no-underscore-dangle
            // @ts-ignore
            sipSession.sessionDescriptionHandler._localMediaStream = newStream;
        }
    }
    updateLocalStream(sipSessionId, newStream) {
        const sipSession = this.sipSessions[sipSessionId];
        if (!sipSession) {
            return;
        }
        const oldStream = this.getLocalStream(sipSessionId);
        logger.info('updating local stream', {
            sipSessionId,
            oldStream: !!oldStream,
            tracks: newStream.getTracks(),
        });
        if (oldStream) {
            this._cleanupStream(oldStream);
        }
        this.setLocalMediaStream(sipSessionId, newStream);
        // Update the local video element
        this._setupMedias(sipSession, newStream);
    }
    updateRemoteStream(sessionId) {
        const remoteStream = this.getRemoteStream(sessionId);
        const pc = this.getPeerConnection(sessionId);
        logger.info('Updating remote stream', {
            sessionId,
            tracks: remoteStream ? remoteStream.getTracks() : null,
            receiverTracks: pc && pc.getReceivers ? pc.getReceivers().map((receiver) => receiver.track) : null,
        });
        if (!pc || !remoteStream) {
            return;
        }
        remoteStream.getTracks().forEach(track => {
            remoteStream.removeTrack(track);
        });
        if (pc.getReceivers) {
            pc.getReceivers().forEach((receiver) => {
                remoteStream.addTrack(receiver.track);
            });
        }
    }
    getMediaConfiguration(enableVideo, conference = false, constraints = null) {
        const screenSharing = constraints && 'screen' in constraints ? constraints.screen : false;
        const isDesktop = constraints && 'desktop' in constraints ? constraints.desktop : false;
        const withAudio = constraints && 'audio' in constraints ? constraints.audio : true;
        const mandatoryVideo = constraints && typeof constraints.video === 'object' ? constraints.video.mandatory : {};
        logger.info('Retrieving media a configuration', {
            enableVideo,
            screenSharing,
            isDesktop,
            withAudio,
            constraints,
        });
        return {
            constraints: {
                // Exact constraint are not supported with `getDisplayMedia` and we must have a video=false in desktop screenshare
                audio: screenSharing ? !isDesktop : withAudio ? this._getAudioConstraints() : false,
                video: screenSharing ? isDesktop ? {
                    mandatory: Object.assign({ chromeMediaSource: 'desktop' }, (mandatoryVideo || {})),
                } : {
                    cursor: 'always',
                } : this._getVideoConstraints(enableVideo),
                screen: screenSharing,
                desktop: isDesktop,
                conference,
            },
            enableVideo,
            conference,
            offerOptions: {
                OfferToReceiveAudio: this._hasAudio(),
                OfferToReceiveVideo: enableVideo,
                mandatory: {
                    OfferToReceiveAudio: this._hasAudio(),
                    OfferToReceiveVideo: enableVideo,
                },
            },
        };
    }
    isConference(sessionId) {
        return sessionId in this.conferences;
    }
    createAudioElementFor(sessionId) {
        const audio = document.createElement('audio');
        audio.setAttribute('id', `audio-${sessionId}`);
        if (audio.setSinkId && this.audioOutputDeviceId) {
            audio.setSinkId(this.audioOutputDeviceId);
        }
        if (document.body) {
            document.body.appendChild(audio);
        }
        this.audioElements[sessionId] = audio;
        audio.volume = this.audioOutputVolume;
        audio.autoplay = true;
        return audio;
    }
    _onTransportError() {
        logger.error('on transport error');
        this.eventEmitter.emit(TRANSPORT_ERROR);
        this.attemptReconnection();
    }
    _onHeartbeat(message) {
        const body = message && typeof message === 'object' ? message.data : message;
        if (body && body.indexOf('200 OK') !== -1) {
            if (this.hasHeartbeat()) {
                logger.info('on heartbeat received from Asterisk', {
                    hasHeartbeat: this.hasHeartbeat(),
                });
                this.heartbeat.onHeartbeat();
                if (this.heartbeatCb) {
                    this.heartbeatCb();
                }
            }
        }
    }
    _onHeartbeatTimeout() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.warn('sdk webrtc heartbeat timed out', {
                userAgent: !!this.userAgent,
                cb: !!this.heartbeatTimeoutCb,
            });
            if (this.heartbeatTimeoutCb) {
                this.heartbeatTimeoutCb();
            }
            if (this.userAgent && this.userAgent.transport) {
                // Disconnect from WS and triggers events, but do not trigger disconnect if already disconnecting...
                // @ts-ignore
                if (!this.userAgent.transport.transitioningState && !this.userAgent.transport.disconnectPromise) {
                    try {
                        yield this.userAgent.transport.disconnect();
                    }
                    catch (e) {
                        logger.error('Transport disconnection after heartbeat timeout, error', e);
                    }
                }
                // We can invoke disconnect() with an error that can be catcher by `onDisconnect`, so we have to trigger it here.
                this._onTransportError();
            }
        });
    }
    _isWeb() {
        return typeof window === 'object' && typeof document === 'object';
    }
    _isVideoTrack(track) {
        return track.kind === 'video' && track.readyState === 'live';
    }
    _hasAudio() {
        return this.hasAudio;
    }
    _getAudioConstraints() {
        var _a, _b;
        // @ts-ignore
        return ((_b = (_a = this.audio) === null || _a === void 0 ? void 0 : _a.deviceId) === null || _b === void 0 ? void 0 : _b.exact) ? this.audio : true;
    }
    _getVideoConstraints(video = false) {
        var _a, _b;
        if (!video) {
            return false;
        }
        // @ts-ignore
        return ((_b = (_a = this.video) === null || _a === void 0 ? void 0 : _a.deviceId) === null || _b === void 0 ? void 0 : _b.exact) ? this.video : true;
    }
    _connectIfNeeded() {
        logger.info('connect if needed, checking', {
            connected: this.isConnected(),
        });
        if (!this.userAgent) {
            logger.info('need to recreate User Agent');
            this.userAgent = this.createUserAgent(this.uaConfigOverrides);
        }
        if (this.isConnected()) {
            logger.info('webrtc sdk, already connected');
            return Promise.resolve();
        }
        if (this.isConnecting()) {
            logger.info('webrtc sdk, already connecting...');
            // @ts-ignore
            this.connectionPromise = this.userAgent.transport.connectPromise;
            return Promise.resolve(this.connectionPromise);
        }
        if (this.connectionPromise) {
            logger.info('webrtc sdk, connection promise connecting...');
            return this.connectionPromise;
        }
        logger.info('WebRTC UA needs to connect');
        // Force UA to reconnect
        if (this.userAgent && this.userAgent.state !== user_agent_state_1.UserAgentState.Stopped) {
            // @ts-ignore
            this.userAgent.transitionState(user_agent_state_1.UserAgentState.Stopped);
        }
        if (this.userAgent.transport && this.userAgent.transport.state !== transport_state_1.TransportState.Disconnected) {
            // @ts-ignore
            this.userAgent.transport.transitionState(transport_state_1.TransportState.Disconnected);
        }
        this.connectionPromise = this.userAgent.start().catch(console.error);
        return this.connectionPromise;
    }
    _buildConfig(config, session) {
        // If no session provided, return the configuration directly
        if (!session) {
            return new Promise(resolve => resolve(config));
        }
        const client = new api_client_1.default({
            server: config.host,
        });
        // @ts-ignore
        client.setToken(session.token);
        // @ts-ignore
        client.setRefreshToken(session.refreshToken);
        // @ts-ignore
        return client.confd.getUserLineSipFromToken(session.uuid).then(sipLine => (Object.assign({ authorizationUser: sipLine.username, password: sipLine.secret, uri: `${sipLine.username}@${config.host}` }, config)));
    }
    _createWebRTCConfiguration(configOverrides = {}) {
        let { host, } = this.config;
        let port = this.config.port || 443;
        if (this.config.websocketSip) {
            const webSocketSip = this.config.websocketSip.split(':');
            [host] = webSocketSip;
            port = Number(webSocketSip[1]);
        }
        const config = {
            authorizationUsername: this.config.authorizationUser,
            authorizationPassword: this.config.password,
            displayName: this.config.displayName,
            autoStart: true,
            hackIpInContact: true,
            contactParams: {
                transport: 'wss',
            },
            logBuiltinEnabled: this.config.log ? this.config.log.builtinEnabled : null,
            logLevel: this.config.log ? this.config.log.logLevel : null,
            logConnector: this.config.log ? this.config.log.connector : null,
            uri: this._makeURI(this.config.authorizationUser || ''),
            userAgentString: this.config.userAgentString || 'wazo-sdk',
            reconnectionAttempts: 10000,
            reconnectionDelay: 5,
            sessionDescriptionHandlerFactory: (session, options = {}) => {
                const uaLogger = session.userAgent.getLogger('sip.WazoSessionDescriptionHandler');
                const isWeb = this._isWeb();
                // @ts-ignore
                const iceGatheringTimeout = 'peerConnectionOptions' in options ? options.peerConnectionOptions.iceGatheringTimeout || DEFAULT_ICE_TIMEOUT : DEFAULT_ICE_TIMEOUT;
                const sdhOptions = Object.assign(Object.assign({}, options), { iceGatheringTimeout, peerConnectionConfiguration: Object.assign(Object.assign({}, (0, peer_connection_configuration_default_1.defaultPeerConnectionConfiguration)()), (options.peerConnectionConfiguration || {})) });
                return new WazoSessionDescriptionHandler_1.default(uaLogger, WazoSessionDescriptionHandler_1.wazoMediaStreamFactory, sdhOptions, isWeb, session);
            },
            transportOptions: {
                traceSip: (configOverrides === null || configOverrides === void 0 ? void 0 : configOverrides.traceSip) || false,
                wsServers: `wss://${host}:${port}/api/asterisk/ws`,
            },
            sessionDescriptionHandlerFactoryOptions: {
                modifiers: [exports.replaceLocalIpModifier],
                alwaysAcquireMediaFirst: this.isFirefox(),
                constraints: {
                    audio: this._getAudioConstraints(),
                    video: this._getVideoConstraints(),
                },
                peerConnectionOptions: {
                    iceCheckingTimeout: this.config.iceCheckingTimeout || 1000,
                    iceGatheringTimeout: this.config.iceCheckingTimeout || 1000,
                    rtcConfiguration: Object.assign(Object.assign({ rtcpMuxPolicy: 'require', iceServers: WebRTCClient.getIceServers(this.config.host) }, this._getRtcOptions()), ((configOverrides === null || configOverrides === void 0 ? void 0 : configOverrides.peerConnectionOptions) || {})),
                },
                // Configuration used in SDH to create the PeerConnection
                peerConnectionConfiguration: Object.assign({ rtcpMuxPolicy: 'require', iceServers: WebRTCClient.getIceServers(this.config.host) }, ((configOverrides === null || configOverrides === void 0 ? void 0 : configOverrides.peerConnectionOptions) || {})),
            },
        };
        return Object.assign(Object.assign({}, config), configOverrides);
    }
    // eslint-disable-next-line no-unused-vars
    _getRtcOptions() {
        return {
            mandatory: {
                OfferToReceiveAudio: this._hasAudio(),
                OfferToReceiveVideo: false,
            },
        };
    }
    // Invitation and Inviter extends Session
    _setupSession(session) {
        const sipSessionId = this.getSipSessionId(session);
        // When receiving an Invitation, the delegate is not defined.
        if (!session.delegate) {
            session.delegate = {};
        }
        session.delegate.onSessionDescriptionHandler = (sdh) => {
            // @ts-ignore
            sdh.on('error', e => {
                this.eventEmitter.emit(ON_ERROR, e);
            });
            sdh.peerConnectionDelegate = {
                onicecandidateerror: (error) => {
                    logger.error('on icecandidate error', {
                        address: error.address,
                        port: error.port,
                        errorCode: error.errorCode,
                        errorText: error.errorText,
                        url: error.url,
                    });
                },
            };
        };
        // @ts-ignore
        const oldInviteRequest = session.onInviteRequest.bind(session);
        let hadRemoteVideo = false;
        // Monkey patch `onInviteRequest` to be able to know if there was a remote video stream before `onInvite` is called
        // Because when `onInvite` is called we already got the video track
        // @ts-ignore
        session.onInviteRequest = request => {
            hadRemoteVideo = this.hasARemoteVideoTrack(sipSessionId);
            oldInviteRequest(request);
        };
        session.delegate.onInvite = (request) => {
            let updatedCalleeName = null;
            let updatedNumber = null;
            if (session.assertedIdentity) {
                // @ts-ignore
                updatedNumber = session.assertedIdentity.uri.normal.user;
                updatedCalleeName = session.assertedIdentity.displayName || updatedNumber;
            }
            logger.info('re-invite received', {
                updatedCalleeName,
                updatedNumber,
                hadRemoteVideo,
            });
            // Useful to know if it's a video upgrade or an unhold from a remote peer with a video stream
            // Update SDP
            // Remote video is handled by the `track` event. Here we're dealing with video stream removal.
            if (session instanceof api_1.Invitation) {
                // @ts-ignore
                session.incomingInviteRequest.message.body = request.body;
                // @ts-ignore
            }
            else if (session instanceof api_1.Inviter && session.outgoingInviteRequest.message.body) {
                // @ts-ignore
                session.outgoingInviteRequest.message.body.body = request.body;
            }
            this.updateRemoteStream(sipSessionId);
            this._setupMedias(session);
            return this.eventEmitter.emit(ON_REINVITE, session, request, updatedCalleeName, updatedNumber, hadRemoteVideo);
        };
    }
    _onEarlyProgress(session) {
        this._setupMedias(session);
        const sessionId = this.getSipSessionId(session).substr(0, 20);
        this.updateRemoteStream(sessionId);
        logger.info('Early media progress progress received', {
            sessionId,
        });
        this.eventEmitter.emit(ON_EARLY_MEDIA, session);
    }
    _onAccepted(session, sessionDialog, withEvent = true) {
        var _a;
        logger.info('on call accepted', {
            id: session.id,
            // @ts-ignore
            remoteTag: session.remoteTag,
        });
        this.storeSipSession(session);
        this._setupMedias(session);
        this.updateRemoteStream(this.getSipSessionId(session));
        // @ts-ignore
        const pc = (_a = session.sessionDescriptionHandler) === null || _a === void 0 ? void 0 : _a.peerConnection;
        const onTrack = (event) => {
            const isAudioOnly = this._isAudioOnly(session);
            const { kind, label, readyState, id, muted, } = event.track;
            logger.info('on track event', {
                isAudioOnly,
                kind,
                label,
                readyState,
                id,
                muted,
            });
            // Stop video track in audio only mode
            if (isAudioOnly && kind === 'video') {
                event.track.stop();
            }
            this.eventEmitter.emit(ON_TRACK, session, event);
        };
        // @ts-ignore
        if (session.sessionDescriptionHandler.peerConnection) {
            // @ts-ignore
            session.sessionDescriptionHandler.peerConnection.addEventListener('track', onTrack);
        }
        // @ts-ignore
        session.sessionDescriptionHandler.remoteMediaStream.onaddtrack = onTrack;
        if (pc) {
            pc.oniceconnectionstatechange = () => {
                logger.info('on ice connection state changed', {
                    state: pc.iceConnectionState,
                });
                if (pc.iceConnectionState === 'disconnected') {
                    this.eventEmitter.emit(ON_DISCONNECTED);
                }
            };
        }
        if (withEvent) {
            this.eventEmitter.emit(ACCEPTED, session, sessionDialog);
        }
        this._startSendingStats(session);
    }
    _isAudioOnly(session) {
        return Boolean(session.sessionDescriptionHandlerModifiersReInvite.find(modifier => modifier === modifiers_1.stripVideo));
    }
    _setupMedias(session, newStream = null) {
        // Safari hack, because you cannot call .play() from a non user action
        const sessionId = this.getSipSessionId(session);
        const isConference = this.isConference(sessionId);
        if (sessionId in this.audioElements) {
            logger.info('html element already exists for session', {
                sessionId,
            });
            return;
        }
        if (this._hasAudio() && this._isWeb() && !(sessionId in this.audioElements)) {
            this.createAudioElementFor(sessionId);
        }
        const audioElement = this.audioElements[sessionId];
        // @ts-ignore
        const sipSession = this.sipSessions[session.callId];
        const removeStream = this.getRemoteStream(sessionId);
        // @ts-ignore
        const earlyStream = sipSession && sipSession.sessionDescriptionHandler ? sipSession.sessionDescriptionHandler.remoteMediaStream : null;
        const stream = newStream || removeStream || earlyStream;
        if (!this._isWeb() || !stream) {
            return;
        }
        if (isConference) {
            // Conference local stream is handled in Room
            return;
        }
        if (audioElement.currentTime > 0 && !audioElement.paused && !audioElement.ended && audioElement.readyState > 2) {
            audioElement.pause();
        }
        audioElement.srcObject = stream;
        audioElement.volume = this.audioOutputVolume;
        audioElement.play().catch(() => { });
    }
    _cleanupMedia(session) {
        const sessionId = this.getSipSessionId(session);
        const localStream = this.getLocalStream(sessionId);
        if (localStream) {
            this._cleanupStream(localStream);
        }
        const cleanLocalElement = (id) => {
            const element = this.audioElements[id];
            if (!element) {
                return;
            }
            element.pause();
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            element.srcObject = null;
            delete this.audioElements[id];
        };
        if (this._hasAudio() && this._isWeb()) {
            if (session) {
                cleanLocalElement(this.getSipSessionId(session));
            }
            else {
                Object.keys(this.audioElements).forEach(id => cleanLocalElement(id));
            }
        }
    }
    _cleanupStream(stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    _toggleAudio(session, muteAudio) {
        // @ts-ignore
        const pc = session.sessionDescriptionHandler ? session.sessionDescriptionHandler.peerConnection : null;
        if (!pc) {
            return;
        }
        if (pc.getSenders) {
            pc.getSenders().forEach((sender) => {
                if (sender && sender.track && sender.track.kind === 'audio') {
                    // eslint-disable-next-line
                    sender.track.enabled = !muteAudio;
                }
            });
        }
        else {
            pc.getLocalStreams().forEach((stream) => {
                stream.getAudioTracks().forEach(track => {
                    // eslint-disable-next-line
                    track.enabled = !muteAudio;
                });
            });
        }
    }
    _toggleVideo(session, muteCamera) {
        var _a;
        // @ts-ignore
        const pc = (_a = session.sessionDescriptionHandler) === null || _a === void 0 ? void 0 : _a.peerConnection;
        if (pc.getSenders) {
            pc.getSenders().forEach((sender) => {
                if (sender && sender.track && sender.track.kind === 'video') {
                    // eslint-disable-next-line
                    sender.track.enabled = !muteCamera;
                }
            });
        }
        else {
            pc.getLocalStreams().forEach((stream) => {
                stream.getVideoTracks().forEach(track => {
                    // eslint-disable-next-line
                    track.enabled = !muteCamera;
                });
            });
        }
    }
    /**
     * @param pc RTCPeerConnection
     */
    _getRemoteStream(pc) {
        let remoteStream = null;
        if (pc && pc.getReceivers) {
            remoteStream = typeof global !== 'undefined' && global.window && global.window.MediaStream ? new global.window.MediaStream() : new window.MediaStream();
            pc.getReceivers().forEach((receiver) => {
                const { track, } = receiver;
                if (track && remoteStream) {
                    remoteStream.addTrack(track);
                }
            });
        }
        else if (pc) {
            [remoteStream] = pc.getRemoteStreams();
        }
        return remoteStream;
    }
    _cleanupRegister() {
        if (this.registerer) {
            // @ts-ignore
            this.registerer.stateChange.removeAllListeners();
            this.registerer = null;
        }
    }
    _startSendingStats(session) {
        // @ts-ignore
        const pc = session.sessionDescriptionHandler.peerConnection;
        if (!pc) {
            return;
        }
        const sessionId = this.getSipSessionId(session);
        (0, getstats_1.default)(pc, (result) => {
            const { results, internal, nomore } = result, stats = __rest(result, ["results", "internal", "nomore"]);
            this.statsIntervals[sessionId] = nomore;
            statsLogger.trace('stats', Object.assign({ sessionId }, stats));
        }, SEND_STATS_DELAY);
    }
    _stopSendingStats(session) {
        const sessionId = this.getSipSessionId(session);
        logger.trace('Check for stopping stats', {
            sessionId,
            ids: Object.keys(this.statsIntervals),
        });
        if (sessionId in this.statsIntervals) {
            logger.trace('Stop sending stats for call', {
                sessionId,
            });
            this.statsIntervals[sessionId]();
            delete this.statsIntervals[sessionId];
        }
    }
    _makeURI(target) {
        return user_agent_1.UserAgent.makeURI(`sip:${target}@${this.config.host}`);
    }
    _disconnectTransport(force = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (force && this.userAgent && this.userAgent.transport) {
                // Bypass sip.js state machine that prevent to close WS with the state `Connecting`
                // @ts-ignore
                this.userAgent.transport.disconnectResolve = () => { };
                // @ts-ignore
                if (this.userAgent.transport._ws) {
                    // @ts-ignore
                    this.userAgent.transport._ws.close(1000);
                }
                return;
            }
            // Check if `disconnectPromise` is not present to avoid `Disconnect promise must not be defined` errors.
            // @ts-ignore
            if (this.userAgent && this.userAgent.transport && !this.userAgent.transport.disconnectPromise) {
                try {
                    yield this.userAgent.transport.disconnect();
                }
                catch (e) {
                    logger.error('WebRTC transport disconnect, error', e);
                }
            }
        });
    }
    _fetchNetworkStats(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = this.getSipSession(sessionId);
            const stats = session ? yield this.getStats(session) : null;
            if (!stats || !(sessionId in this.sessionNetworkStats)) {
                return Promise.resolve(null);
            }
            const networkStats = {
                audioBytesSent: 0,
                videoBytesSent: 0,
                videoBytesReceived: 0,
                audioBytesReceived: 0,
            };
            const nbStats = this.sessionNetworkStats[sessionId].length;
            const lastNetworkStats = this.sessionNetworkStats[sessionId][nbStats - 1];
            const lastAudioSent = lastNetworkStats ? lastNetworkStats.audioBytesSent : 0;
            const lastAudioContentSent = lastNetworkStats ? lastNetworkStats.audioContentSent : 0;
            const lastVideoSent = lastNetworkStats ? lastNetworkStats.videoBytesSent : 0;
            const lastAudioReceived = lastNetworkStats ? lastNetworkStats.audioBytesReceived : 0;
            const lastAudioContentReceived = lastNetworkStats ? lastNetworkStats.audioContentReceived : 0;
            const lastVideoReceived = lastNetworkStats ? lastNetworkStats.videoBytesReceived : 0;
            const lastTransportSent = lastNetworkStats ? lastNetworkStats.transportSent : 0;
            const lastTransportReceived = lastNetworkStats ? lastNetworkStats.transportReceived : 0;
            let audioBytesSent = 0; // content + header
            let audioBytesReceived = 0; // content + header
            let audioContentSent = 0; // useful to detect blank call
            let audioContentReceived = 0;
            let videoBytesSent = 0;
            let videoBytesReceived = 0;
            let transportSent = 0;
            let transportReceived = 0;
            let packetsLost = 0;
            stats.forEach(report => {
                if (report.type === 'outbound-rtp' && report.kind === 'audio') {
                    audioBytesSent += Number(report.bytesSent) + Number(report.headerBytesSent);
                    audioContentSent += Number(report.bytesSent);
                }
                if (report.type === 'remote-outbound-rtp' && report.kind === 'audio') {
                    audioBytesSent += Number(report.bytesSent);
                }
                if (report.type === 'outbound-rtp' && report.kind === 'video') {
                    videoBytesSent += Number(report.bytesSent) + Number(report.headerBytesSent);
                }
                if (report.type === 'inbound-rtp' && report.kind === 'audio') {
                    packetsLost += Number(report.packetsLost);
                    networkStats.packetsReceived = Number(report.packetsReceived);
                    audioBytesReceived += Number(report.bytesReceived) + Number(report.headerBytesReceived);
                    audioContentReceived += Number(report.bytesReceived);
                }
                if (report.type === 'inbound-rtp' && report.kind === 'video') {
                    videoBytesReceived += Number(report.bytesReceived) + Number(report.headerBytesReceived);
                }
                if (report.type === 'outbound-rtp' && report.kind === 'video') {
                    if ('framesPerSecond' in report) {
                        networkStats.framesPerSecond = Number(report.framesPerSecond);
                    }
                    if ('framerateMean' in report) {
                        // framerateMean is only available in FF
                        networkStats.framesPerSecond = Math.round(report.framerateMean);
                    }
                }
                if (report.type === 'remote-inbound-rtp' && report.kind === 'audio') {
                    packetsLost += Number(report.packetsLost);
                    networkStats.roundTripTime = Number(report.roundTripTime);
                    networkStats.jitter = Number(report.jitter);
                }
                if (report.type === 'remote-inbound-rtp' && report.kind === 'video') {
                    packetsLost += Number(report.packetsLost);
                }
                if (report.type === 'transport') {
                    transportSent += Number(report.bytesSent);
                    transportReceived += Number(report.bytesReceived);
                }
            });
            networkStats.packetsLost = packetsLost;
            networkStats.totalAudioBytesSent = audioBytesSent;
            networkStats.audioBytesSent = audioBytesSent - lastAudioSent;
            networkStats.totalAudioBytesReceived = audioBytesReceived - lastAudioReceived;
            networkStats.audioBytesReceived = audioBytesReceived;
            networkStats.totalAudioContentSent = audioContentSent;
            networkStats.audioContentSent = audioContentSent - lastAudioContentSent;
            networkStats.totalAudioBytesReceived = audioContentReceived - lastAudioContentReceived;
            networkStats.audioContentReceived = audioContentReceived;
            networkStats.totalVideoBytesSent = videoBytesSent;
            networkStats.videoBytesSent = videoBytesSent - lastVideoSent;
            networkStats.totalVideoBytesReceived = videoBytesReceived;
            networkStats.videoBytesReceived = videoBytesReceived - lastVideoReceived;
            networkStats.totalTransportSent = transportSent - lastTransportSent;
            networkStats.transportSent = transportSent;
            networkStats.totalTransportReceived = transportReceived;
            networkStats.transportReceived = transportReceived - lastTransportReceived;
            networkStats.bandwidth = networkStats.audioBytesSent + networkStats.audioBytesReceived + networkStats.videoBytesSent + networkStats.videoBytesReceived + networkStats.transportReceived + networkStats.transportSent;
            this.eventEmitter.emit(ON_NETWORK_STATS, session, networkStats, this.sessionNetworkStats[sessionId]);
            this.sessionNetworkStats[sessionId].push(networkStats);
        });
    }
}
exports.default = WebRTCClient;
