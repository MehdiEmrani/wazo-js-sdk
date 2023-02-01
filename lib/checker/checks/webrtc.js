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
/* global MediaStream */
const web_rtc_client_1 = __importDefault(require("../../web-rtc-client"));
exports.default = {
    name: 'WebRTC',
    check: (server, session) => new Promise((resolve, reject) => {
        if (typeof MediaStream === 'undefined') {
            return resolve('Skipped on node');
        }
        const client = new web_rtc_client_1.default({
            host: server,
            media: {
                audio: true,
            },
        }, session);
        const handleError = (message) => {
            client.close();
            reject(new Error(message));
        };
        const handleSuccess = () => __awaiter(void 0, void 0, void 0, function* () {
            client.stopHeartbeat();
            yield client.close();
            resolve();
        });
        client.on(client.TRANSPORT_ERROR, error => {
            handleError(`Transport error : ${error}`);
        });
        client.on(client.REGISTERED, () => {
            const sipSession = client.call('*10');
            if (!sipSession || !client.getSipSessionId(sipSession)) {
                return handleError('Unable to make call through WebRTC');
            }
            setTimeout(() => {
                client.hangup(sipSession);
                handleSuccess();
            }, 1000);
        });
    }),
};
