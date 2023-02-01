"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const new_from_1 = __importDefault(require("../utils/new-from"));
class ChatMessage {
    static parseMany(plain) {
        if (!plain || !plain.items) {
            return [];
        }
        return plain.items.map(item => ChatMessage.parse(item));
    }
    static parse(plain) {
        return new ChatMessage({
            uuid: plain.uuid,
            date: (0, moment_1.default)(plain.created_at).toDate(),
            content: plain.content,
            alias: plain.alias,
            userUuid: plain.user_uuid,
            read: true,
            roomUuid: plain.room ? plain.room.uuid : null,
        });
    }
    static newFrom(message) {
        return (0, new_from_1.default)(message, ChatMessage);
    }
    constructor({ uuid, date, content, userUuid, alias, roomUuid, read, } = {}) {
        this.uuid = uuid;
        this.date = date;
        this.content = content;
        this.userUuid = userUuid;
        this.alias = alias;
        this.roomUuid = roomUuid;
        // @TODO: change after message read status available
        this.read = read;
        // Useful to compare instead of instanceof with minified code
        this.type = 'ChatMessage';
    }
    is(other) {
        return this.uuid === other.uuid;
    }
    isIncoming(userUuid) {
        return this.userUuid !== userUuid;
    }
    acknowledge() {
        // @TODO: change after message read status available
        this.read = true;
        return this;
    }
}
exports.default = ChatMessage;
