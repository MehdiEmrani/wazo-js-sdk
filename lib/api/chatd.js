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
const api_requester_1 = __importDefault(require("../utils/api-requester"));
const Profile_1 = __importDefault(require("../domain/Profile"));
const ChatRoom_1 = __importDefault(require("../domain/ChatRoom"));
const ChatMessage_1 = __importDefault(require("../domain/ChatMessage"));
exports.default = ((client, baseUrl) => ({
    updateState: (contactUuid, state) => client.put(`${baseUrl}/users/${contactUuid}/presences`, {
        state,
    }, null, api_requester_1.default.successResponseParser),
    updateStatus: (contactUuid, state, status) => {
        const body = {
            state,
            status,
        };
        return client.put(`${baseUrl}/users/${contactUuid}/presences`, body, null, api_requester_1.default.successResponseParser);
    },
    getState: (contactUuid) => __awaiter(void 0, void 0, void 0, function* () { return client.get(`${baseUrl}/users/${contactUuid}/presences`).then((response) => response.state); }),
    getContactStatusInfo: (contactUuid) => __awaiter(void 0, void 0, void 0, function* () { return client.get(`${baseUrl}/users/${contactUuid}/presences`).then((response) => response); }),
    getLineState: (contactUuid) => __awaiter(void 0, void 0, void 0, function* () { return client.get(`${baseUrl}/users/${contactUuid}/presences`).then((response) => Profile_1.default.getLinesState(response.lines)); }),
    getMultipleLineState: (contactUuids) => __awaiter(void 0, void 0, void 0, function* () {
        const body = {};
        if (contactUuids && contactUuids.length) {
            body.user_uuid = contactUuids.join(',');
        }
        return client.get(`${baseUrl}/users/presences`, body).then((response) => response.items);
    }),
    getUserRooms: () => __awaiter(void 0, void 0, void 0, function* () { return client.get(`${baseUrl}/users/me/rooms`).then(ChatRoom_1.default.parseMany); }),
    createRoom: (name, users) => __awaiter(void 0, void 0, void 0, function* () {
        return client.post(`${baseUrl}/users/me/rooms`, {
            name,
            users,
        }).then(ChatRoom_1.default.parse);
    }),
    getRoomMessages: (roomUuid, params) => __awaiter(void 0, void 0, void 0, function* () {
        const qs = api_requester_1.default.getQueryString(params || {});
        return client.get(`${baseUrl}/users/me/rooms/${roomUuid}/messages${qs.length ? `?${qs}` : ''}`).then((response) => ChatMessage_1.default.parseMany(response));
    }),
    sendRoomMessage: (roomUuid, message) => __awaiter(void 0, void 0, void 0, function* () { return client.post(`${baseUrl}/users/me/rooms/${roomUuid}/messages`, message).then(ChatMessage_1.default.parse); }),
    getMessages: (options) => __awaiter(void 0, void 0, void 0, function* () { return client.get(`${baseUrl}/users/me/rooms/messages`, options); }),
}));
