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
exports.APPLICATION_DESTINATION_NODE_CREATED = exports.APPLICATION_PROGRESS_STOPPED = exports.APPLICATION_PROGRESS_STARTED = exports.APPLICATION_CALL_ANSWERED = exports.APPLICATION_CALL_UPDATED = exports.APPLICATION_CALL_DELETED = exports.APPLICATION_CALL_INITIATED = exports.APPLICATION_CALL_ENTERED = exports.APPLICATION_CALL_DTMF_RECEIVED = exports.FAX_OUTBOUND_USER_FAILED = exports.FAX_OUTBOUND_USER_SUCCEEDED = exports.FAX_OUTBOUND_USER_CREATED = exports.SWITCHBOARD_HELD_CALL_ANSWERED = exports.SWITCHBOARD_HELD_CALLS_UPDATED = exports.SWITCHBOARD_QUEUED_CALL_ANSWERED = exports.SWITCHBOARD_QUEUED_CALLS_UPDATED = exports.MEETING_USER_PARTICIPANT_LEFT = exports.MEETING_USER_PARTICIPANT_JOINED = exports.CONFERENCE_USER_PARTICIPANT_TALK_STOPPED = exports.CONFERENCE_USER_PARTICIPANT_TALK_STARTED = exports.CONFERENCE_USER_PARTICIPANT_LEFT = exports.CONFERENCE_USER_PARTICIPANT_JOINED = exports.CHATD_USER_ROOM_CREATED = exports.CHATD_USER_ROOM_MESSAGE_CREATED = exports.CHATD_PRESENCE_UPDATED = exports.AUTH_USER_EXTERNAL_AUTH_DELETED = exports.AUTH_USER_EXTERNAL_AUTH_ADDED = exports.CALL_RESUMED = exports.CALL_HELD = exports.CALL_UPDATED = exports.CALL_ENDED = exports.CALL_DTMF_CREATED = exports.CALL_ANSWERED = exports.CALL_CREATED = exports.CALL_LOG_USER_CREATED = exports.USER_VOICEMAIL_MESSAGE_DELETED = exports.USER_VOICEMAIL_MESSAGE_UPDATED = exports.USER_VOICEMAIL_MESSAGE_CREATED = exports.USERS_SERVICES_DND_UPDATED = exports.USERS_FORWARDS_UNCONDITIONAL_UPDATED = exports.USERS_FORWARDS_NOANSWER_UPDATED = exports.USERS_FORWARDS_BUSY_UPDATED = exports.ENDPOINT_STATUS_UPDATE = exports.CHAT_MESSAGE_RECEIVED = exports.CHAT_MESSAGE_SENT = exports.USER_STATUS_UPDATE = exports.FAVORITE_DELETED = exports.FAVORITE_ADDED = exports.AUTH_SESSION_EXPIRE_SOON = exports.SOCKET_EVENTS = void 0;
exports.HEARTBEAT_ENGINE_VERSION = exports.MEETING_USER_GUEST_AUTHORIZATION_CREATED = exports.MEETING_USER_PROGRESS = exports.CONFERENCE_ADHOC_DELETED = exports.CONFERENCE_ADHOC_PARTICIPANT_LEFT = exports.AGENT_UNPAUSED = exports.AGENT_PAUSED = exports.AGENT_STATUS_UPDATE = exports.LINE_STATUS_UPDATED = exports.TRUNK_STATUS_UPDATED = exports.APPLICATION_USER_OUTGOING_CALL_CREATED = exports.APPLICATION_SNOOP_UPDATED = exports.APPLICATION_SNOOP_DELETED = exports.APPLICATION_SNOOP_CREATED = exports.APPLICATION_PLAYBACK_DELETED = exports.APPLICATION_PLAYBACK_CREATED = exports.APPLICATION_NODE_UPDATED = exports.APPLICATION_NODE_DELETED = exports.APPLICATION_NODE_CREATED = void 0;
/* eslint-disable no-underscore-dangle */
const reconnecting_websocket_1 = __importDefault(require("reconnecting-websocket"));
const Emitter_1 = __importDefault(require("./utils/Emitter"));
const IssueReporter_1 = __importDefault(require("./service/IssueReporter"));
const Heartbeat_1 = __importDefault(require("./utils/Heartbeat"));
exports.SOCKET_EVENTS = {
    ON_OPEN: 'onopen',
    ON_MESSAGE: 'onmessage',
    ON_ERROR: 'onerror',
    ON_CLOSE: 'onclose',
    INITIALIZED: 'initialized',
    ON_AUTH_FAILED: 'on_auth_failed',
};
exports.AUTH_SESSION_EXPIRE_SOON = 'auth_session_expire_soon';
exports.FAVORITE_ADDED = 'favorite_added';
exports.FAVORITE_DELETED = 'favorite_deleted';
exports.USER_STATUS_UPDATE = 'user_status_update';
exports.CHAT_MESSAGE_SENT = 'chat_message_sent';
exports.CHAT_MESSAGE_RECEIVED = 'chat_message_received';
exports.ENDPOINT_STATUS_UPDATE = 'endpoint_status_update';
exports.USERS_FORWARDS_BUSY_UPDATED = 'users_forwards_busy_updated';
exports.USERS_FORWARDS_NOANSWER_UPDATED = 'users_forwards_noanswer_updated';
exports.USERS_FORWARDS_UNCONDITIONAL_UPDATED = 'users_forwards_unconditional_updated';
exports.USERS_SERVICES_DND_UPDATED = 'users_services_dnd_updated';
exports.USER_VOICEMAIL_MESSAGE_CREATED = 'user_voicemail_message_created';
exports.USER_VOICEMAIL_MESSAGE_UPDATED = 'user_voicemail_message_updated';
exports.USER_VOICEMAIL_MESSAGE_DELETED = 'user_voicemail_message_deleted';
exports.CALL_LOG_USER_CREATED = 'call_log_user_created';
exports.CALL_CREATED = 'call_created';
exports.CALL_ANSWERED = 'call_answered';
exports.CALL_DTMF_CREATED = 'call_dtmf_created';
exports.CALL_ENDED = 'call_ended';
exports.CALL_UPDATED = 'call_updated';
exports.CALL_HELD = 'call_held';
exports.CALL_RESUMED = 'call_resumed';
exports.AUTH_USER_EXTERNAL_AUTH_ADDED = 'auth_user_external_auth_added';
exports.AUTH_USER_EXTERNAL_AUTH_DELETED = 'auth_user_external_auth_deleted';
exports.CHATD_PRESENCE_UPDATED = 'chatd_presence_updated';
exports.CHATD_USER_ROOM_MESSAGE_CREATED = 'chatd_user_room_message_created';
exports.CHATD_USER_ROOM_CREATED = 'chatd_user_room_created';
exports.CONFERENCE_USER_PARTICIPANT_JOINED = 'conference_user_participant_joined';
exports.CONFERENCE_USER_PARTICIPANT_LEFT = 'conference_user_participant_left';
exports.CONFERENCE_USER_PARTICIPANT_TALK_STARTED = 'conference_user_participant_talk_started';
exports.CONFERENCE_USER_PARTICIPANT_TALK_STOPPED = 'conference_user_participant_talk_stopped';
exports.MEETING_USER_PARTICIPANT_JOINED = 'meeting_user_participant_joined';
exports.MEETING_USER_PARTICIPANT_LEFT = 'meeting_user_participant_left';
exports.SWITCHBOARD_QUEUED_CALLS_UPDATED = 'switchboard_queued_calls_updated';
exports.SWITCHBOARD_QUEUED_CALL_ANSWERED = 'switchboard_queued_call_answered';
exports.SWITCHBOARD_HELD_CALLS_UPDATED = 'switchboard_held_calls_updated';
exports.SWITCHBOARD_HELD_CALL_ANSWERED = 'switchboard_held_call_answered';
exports.FAX_OUTBOUND_USER_CREATED = 'fax_outbound_user_created';
exports.FAX_OUTBOUND_USER_SUCCEEDED = 'fax_outbound_user_succeeded';
exports.FAX_OUTBOUND_USER_FAILED = 'fax_outbound_user_failed';
exports.APPLICATION_CALL_DTMF_RECEIVED = 'application_call_dtmf_received';
exports.APPLICATION_CALL_ENTERED = 'application_call_entered';
exports.APPLICATION_CALL_INITIATED = 'application_call_initiated';
exports.APPLICATION_CALL_DELETED = 'application_call_deleted';
exports.APPLICATION_CALL_UPDATED = 'application_call_updated';
exports.APPLICATION_CALL_ANSWERED = 'application_call_answered';
exports.APPLICATION_PROGRESS_STARTED = 'application_progress_started';
exports.APPLICATION_PROGRESS_STOPPED = 'application_progress_stopped';
exports.APPLICATION_DESTINATION_NODE_CREATED = 'application_destination_node_created';
exports.APPLICATION_NODE_CREATED = 'application_node_created';
exports.APPLICATION_NODE_DELETED = 'application_node_deleted';
exports.APPLICATION_NODE_UPDATED = 'application_node_updated';
exports.APPLICATION_PLAYBACK_CREATED = 'application_playback_created';
exports.APPLICATION_PLAYBACK_DELETED = 'application_playback_deleted';
exports.APPLICATION_SNOOP_CREATED = 'application_snoop_created';
exports.APPLICATION_SNOOP_DELETED = 'application_snoop_deleted';
exports.APPLICATION_SNOOP_UPDATED = 'application_snoop_updated';
exports.APPLICATION_USER_OUTGOING_CALL_CREATED = 'application_user_outgoing_call_created';
exports.TRUNK_STATUS_UPDATED = 'trunk_status_updated';
exports.LINE_STATUS_UPDATED = 'line_status_updated';
exports.AGENT_STATUS_UPDATE = 'agent_status_update';
exports.AGENT_PAUSED = 'agent_paused';
exports.AGENT_UNPAUSED = 'agent_unpaused';
exports.CONFERENCE_ADHOC_PARTICIPANT_LEFT = 'conference_adhoc_participant_left';
exports.CONFERENCE_ADHOC_DELETED = 'conference_adhoc_deleted';
exports.MEETING_USER_PROGRESS = 'meeting_user_progress';
exports.MEETING_USER_GUEST_AUTHORIZATION_CREATED = 'meeting_user_guest_authorization_created';
const BLACKLIST_EVENTS = [exports.CHAT_MESSAGE_SENT, exports.CHAT_MESSAGE_RECEIVED, exports.CHATD_USER_ROOM_MESSAGE_CREATED, exports.CHATD_USER_ROOM_CREATED];
exports.HEARTBEAT_ENGINE_VERSION = '20.09';
const logger = IssueReporter_1.default.loggerFor('wazo-ws');
const messageLogger = IssueReporter_1.default.loggerFor('wazo-ws-message');
class WebSocketClient extends Emitter_1.default {
    /**
     *
     * @param host
     * @param token
     * @param events
     * @param version
     * @param heartbeat
     * @param options @see https://github.com/pladaria/reconnecting-websocket#available-options
     */
    constructor({ host, token, version, events, heartbeat, }, options = {
        host,
        token,
        version: 1,
        events: [],
        heartbeat: {},
    }) {
        super();
        this.initialized = false;
        this.socket = null;
        this.host = host;
        this.token = token;
        this.events = events;
        this.options = options;
        this.version = version;
        this._boundOnHeartbeat = this._onHeartbeat.bind(this);
        const { delay, timeout, max, } = heartbeat || {};
        this.heartbeat = new Heartbeat_1.default(delay, timeout, max);
        this.heartbeat.setSendHeartbeat(this.pingServer.bind(this));
        this.heartbeat.setOnHeartbeatTimeout(this._onHeartbeatTimeout.bind(this));
        this.eventLists = WebSocketClient.eventLists;
    }
    connect() {
        logger.info('connect method started', {
            host: this.host,
            token: this.token,
        });
        this.socket = new reconnecting_websocket_1.default(this._getUrl.bind(this), [], this.options);
        if (this.options.binaryType) {
            this.socket.binaryType = this.options.binaryType;
        }
        this.socket.onopen = () => {
            logger.info('on Wazo WS open', {
                method: 'connect',
                host: this.host,
            });
            this.eventEmitter.emit(exports.SOCKET_EVENTS.ON_OPEN);
        };
        this.socket.onerror = event => {
            logger.error('on Wazo WS error', event.target);
            this.eventEmitter.emit(exports.SOCKET_EVENTS.ON_ERROR, event);
        };
        this.socket.onmessage = (event) => {
            this.eventEmitter.emit(exports.SOCKET_EVENTS.ON_MESSAGE, event.data);
            const message = JSON.parse(typeof event.data === 'string' ? event.data : '{}');
            let { name, } = message;
            if (message.data && message.data.name) {
                // eslint-disable-next-line
                name = message.data.name;
            }
            if (BLACKLIST_EVENTS.indexOf(name) === -1) {
                messageLogger.trace(IssueReporter_1.default.removeSlashes(event.data), {
                    method: 'onmessage',
                });
            }
            else {
                messageLogger.trace(`{"name": "${name}", "info": "content not shown"}`, {
                    method: 'onmessage',
                });
            }
            if (!this.initialized) {
                this._handleInitMessage(message, this.socket);
            }
            else {
                this._handleMessage(message);
            }
        };
        this.socket.onclose = event => {
            // Can't be converted to JSON (circular structure)
            logger.info('on Wazo WS close', {
                reason: event.reason,
                code: event.code,
                readyState: event.target.readyState,
                host: this.host,
                token: this.token,
            });
            this.initialized = false;
            this.eventEmitter.emit(exports.SOCKET_EVENTS.ON_CLOSE, event);
            switch (event.code) {
                case 4002:
                    this.eventEmitter.emit(exports.SOCKET_EVENTS.ON_AUTH_FAILED);
                    break;
                case 4003:
                    break;
                default:
            }
        };
        this.socket.onerror = event => {
            logger.info('Wazo WS error', {
                message: event.message,
                // @ts-ignore
                code: event.code,
                readyState: event.target.readyState,
            });
        };
    }
    close(force = false) {
        logger.info('Wazo WS close', {
            socket: !!this.socket,
            host: this.host,
            token: this.token,
        });
        if (!this.socket) {
            return;
        }
        this.socket.close();
        this.initialized = false;
        if (force) {
            this.host = null;
            this.token = null;
            this.socket = null;
        }
    }
    updateToken(token) {
        this.token = token;
        logger.info('Wazo WS updating token', {
            url: this._getUrl(),
            token,
            socket: !!this.socket,
        });
        if (this.socket) {
            // If still connected, send the token to the WS
            if (this.isConnected() && Number(this.version) >= 2) {
                this.socket.send(JSON.stringify({
                    op: 'token',
                    data: {
                        token,
                    },
                }));
            }
            else if (!this.isConnected()) {
                this.reconnect('token refreshed');
            }
        }
    }
    hasHeartbeat() {
        return this.heartbeat.hasHeartbeat;
    }
    startHeartbeat() {
        logger.info('Wazo WS start heartbeat', {
            host: this.host,
            token: this.token,
        });
        if (!this.socket) {
            this.heartbeat.stop();
            return;
        }
        this.off('pong', this._boundOnHeartbeat);
        this.on('pong', this._boundOnHeartbeat);
        this.heartbeat.start();
    }
    stopHeartbeat() {
        logger.info('Wazo WS stop heartbeat', {
            host: this.host,
            token: this.token,
        });
        this.heartbeat.stop();
    }
    setOnHeartbeatTimeout(cb) {
        this.onHeartBeatTimeout = cb;
    }
    setOnHeartbeatCallback(cb) {
        this.heartbeatCb = cb;
    }
    pingServer() {
        if (!this.socket || !this.isConnected()) {
            return;
        }
        try {
            this.socket.send(JSON.stringify({
                op: 'ping',
                data: {
                    payload: 'pong',
                },
            }));
        }
        catch (_) { // Nothing to do
        }
    }
    isConnected() {
        return this.socket && this.socket.readyState === this.socket.OPEN;
    }
    reconnect(reason) {
        logger.info('Wazo WS reconnect', {
            reason,
            socket: !!this.socket,
            host: this.host,
            token: this.token,
        });
        if (!this.socket) {
            return;
        }
        // @HEADS UP: first arg is `code`, second is `reason`; inputing arbitrary value for `code`
        this.socket.reconnect(0, reason);
    }
    _handleInitMessage(message, sock) {
        var _a;
        switch (message.op) {
            case 'init':
                (_a = this.events) === null || _a === void 0 ? void 0 : _a.forEach(event => {
                    const op = {
                        op: 'subscribe',
                        data: {
                            event_name: event,
                        },
                    };
                    sock.send(JSON.stringify(op));
                });
                sock.send(JSON.stringify({
                    op: 'start',
                }));
                break;
            case 'subscribe':
                break;
            case 'start':
                this.initialized = true;
                this.eventEmitter.emit(exports.SOCKET_EVENTS.INITIALIZED);
                break;
            default:
                this.eventEmitter.emit('message', message);
        }
    }
    _handleMessage(message) {
        if (message.op === 'pong') {
            this.eventEmitter.emit('pong', message.data);
            if (this.heartbeatCb) {
                this.heartbeatCb();
            }
            return;
        }
        if (this.version === 1) {
            this.eventEmitter.emit(message.name, message);
            return;
        }
        if (Number(this.version) >= 2 && message.op === 'event') {
            this.eventEmitter.emit(message.data.name, message.data);
        }
    }
    _getUrl() {
        if (!this.host || !this.token) {
            this.close();
        }
        const url = `wss://${this.host || ''}/api/websocketd/?token=${this.token || ''}&version=${this.version}`;
        logger.info('Wazo WS url computed to reconnect', {
            url,
        });
        return url;
    }
    _onHeartbeat(message) {
        if (message.payload === 'pong') {
            this.heartbeat.onHeartbeat();
            logger.log('on heartbeat received from Wazo WS');
        }
    }
    _onHeartbeatTimeout() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.log('heartbeat timed out', {
                host: this.host,
                token: this.token,
            });
            this.close();
            this.eventEmitter.emit(exports.SOCKET_EVENTS.ON_CLOSE, new Error('Websocket ping failure.'));
            if (this.onHeartBeatTimeout) {
                this.onHeartBeatTimeout();
            }
        });
    }
} // Can't use static
WebSocketClient.eventLists = [exports.AUTH_SESSION_EXPIRE_SOON, exports.FAVORITE_ADDED, exports.FAVORITE_DELETED, exports.USER_STATUS_UPDATE, exports.CHAT_MESSAGE_SENT, exports.CHAT_MESSAGE_RECEIVED, exports.ENDPOINT_STATUS_UPDATE, exports.USERS_FORWARDS_BUSY_UPDATED, exports.USERS_FORWARDS_NOANSWER_UPDATED, exports.USERS_FORWARDS_UNCONDITIONAL_UPDATED, exports.USERS_SERVICES_DND_UPDATED, exports.USER_VOICEMAIL_MESSAGE_CREATED, exports.USER_VOICEMAIL_MESSAGE_UPDATED, exports.USER_VOICEMAIL_MESSAGE_DELETED, exports.CALL_LOG_USER_CREATED, exports.CALL_ANSWERED, exports.CALL_CREATED, exports.CALL_DTMF_CREATED, exports.CALL_ENDED, exports.CALL_UPDATED, exports.CALL_HELD, exports.CALL_RESUMED, exports.AUTH_USER_EXTERNAL_AUTH_ADDED, exports.AUTH_USER_EXTERNAL_AUTH_DELETED, exports.CHATD_PRESENCE_UPDATED, exports.CHATD_USER_ROOM_MESSAGE_CREATED, exports.CHATD_USER_ROOM_CREATED, exports.CONFERENCE_USER_PARTICIPANT_JOINED, exports.CONFERENCE_USER_PARTICIPANT_LEFT, exports.MEETING_USER_PARTICIPANT_JOINED, exports.MEETING_USER_PARTICIPANT_LEFT, exports.CONFERENCE_USER_PARTICIPANT_TALK_STARTED, exports.CONFERENCE_USER_PARTICIPANT_TALK_STOPPED, exports.SWITCHBOARD_QUEUED_CALLS_UPDATED, exports.SWITCHBOARD_QUEUED_CALL_ANSWERED, exports.SWITCHBOARD_HELD_CALLS_UPDATED, exports.SWITCHBOARD_HELD_CALL_ANSWERED, exports.FAX_OUTBOUND_USER_CREATED, exports.FAX_OUTBOUND_USER_SUCCEEDED, exports.FAX_OUTBOUND_USER_FAILED, exports.APPLICATION_CALL_DTMF_RECEIVED, exports.APPLICATION_CALL_ENTERED, exports.APPLICATION_CALL_INITIATED, exports.APPLICATION_CALL_DELETED, exports.APPLICATION_CALL_UPDATED, exports.APPLICATION_CALL_ANSWERED, exports.APPLICATION_PROGRESS_STARTED, exports.APPLICATION_PROGRESS_STOPPED, exports.APPLICATION_DESTINATION_NODE_CREATED, exports.APPLICATION_NODE_CREATED, exports.APPLICATION_NODE_DELETED, exports.APPLICATION_NODE_UPDATED, exports.APPLICATION_PLAYBACK_CREATED, exports.APPLICATION_PLAYBACK_DELETED, exports.APPLICATION_SNOOP_CREATED, exports.APPLICATION_SNOOP_DELETED, exports.APPLICATION_SNOOP_UPDATED, exports.APPLICATION_USER_OUTGOING_CALL_CREATED, exports.TRUNK_STATUS_UPDATED, exports.LINE_STATUS_UPDATED, exports.AGENT_STATUS_UPDATE, exports.AGENT_PAUSED, exports.AGENT_UNPAUSED, exports.CONFERENCE_ADHOC_PARTICIPANT_LEFT, exports.CONFERENCE_ADHOC_DELETED, exports.MEETING_USER_PROGRESS, exports.MEETING_USER_GUEST_AUTHORIZATION_CREATED];
exports.default = WebSocketClient;
