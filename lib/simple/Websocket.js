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
const websocket_client_1 = __importStar(require("../websocket-client")), WebSocketClient = websocket_client_1;
const Emitter_1 = __importDefault(require("../utils/Emitter"));
const IssueReporter_1 = __importDefault(require("../service/IssueReporter"));
const { SOCKET_EVENTS } = WebSocketClient, OTHER_EVENTS = __rest(WebSocketClient, ["SOCKET_EVENTS"]);
const ALL_EVENTS = [...Object.values(SOCKET_EVENTS), ...Object.values(OTHER_EVENTS)];
const logger = IssueReporter_1.default.loggerFor('simple-ws-client');
class Websocket extends Emitter_1.default {
    constructor() {
        super();
        // Sugar syntax for `Wazo.WebSocket.EVENT_NAME`
        Object.keys(OTHER_EVENTS).forEach(key => {
            // @ts-ignore
            this[key] = OTHER_EVENTS[key];
        });
        Object.keys(SOCKET_EVENTS).forEach(key => {
            // @ts-ignore
            this[key] = SOCKET_EVENTS[key];
        });
        this.eventLists = websocket_client_1.default.eventLists;
        this.ws = null;
    }
    open(host, session) {
        logger.info('open simple WebSocket', {
            host,
            token: session.token,
        });
        this.ws = new websocket_client_1.default({
            host,
            token: session.token,
            events: ['*'],
            version: 2,
        }, {
            rejectUnauthorized: false,
            binaryType: 'arraybuffer',
        });
        this.ws.connect();
        // Re-emit all events
        ALL_EVENTS.forEach((event) => {
            if (!this.ws) {
                return;
            }
            this.ws.on(event, (payload) => {
                this.eventEmitter.emit(event, payload);
            });
        });
    }
    updateToken(token) {
        logger.info('update token via simple Websocket', {
            token,
            ws: !!this.ws,
        });
        if (!this.ws) {
            return;
        }
        this.ws.updateToken(token);
    }
    isOpen() {
        var _a;
        return ((_a = this.ws) === null || _a === void 0 ? void 0 : _a.isConnected()) || false;
    }
    close(force = false) {
        logger.info('Closing Wazo websocket', { force, ws: !!this.ws });
        if (this.ws) {
            this.ws.close(force);
        }
        this.unbind();
    }
}
if (!global.wazoWebsocketInstance) {
    global.wazoWebsocketInstance = new Websocket();
}
exports.default = global.wazoWebsocketInstance;
