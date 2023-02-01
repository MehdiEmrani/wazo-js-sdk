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
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_client_1 = __importStar(require("../../websocket-client"));
exports.default = {
    name: 'Wazo Websocket',
    check: (server, session) => new Promise((resolve, reject) => {
        const client = new websocket_client_1.default({
            host: server,
            token: session.token,
            version: 2,
        });
        const handleError = (message) => {
            client.close();
            reject(new Error(message));
        };
        const handleSuccess = () => {
            client.stopHeartbeat();
            client.close();
            resolve();
        };
        client.on(websocket_client_1.SOCKET_EVENTS.ON_ERROR, error => {
            handleError(`Connection error : ${error}`);
        });
        client.on(websocket_client_1.SOCKET_EVENTS.ON_OPEN, () => {
            if (session.hasEngineVersionGte(websocket_client_1.HEARTBEAT_ENGINE_VERSION)) {
                client.setOnHeartbeatTimeout(() => {
                    handleError('No response to heartbeat');
                });
                client.setOnHeartbeatCallback(() => {
                    handleSuccess();
                });
                client.startHeartbeat();
            }
            else {
                handleSuccess();
            }
        });
        client.connect();
    }),
};
