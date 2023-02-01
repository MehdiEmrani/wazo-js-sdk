"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const new_from_1 = __importDefault(require("../utils/new-from"));
class ChatRoom {
    static parseMany(plain) {
        if (!plain || !plain.items) {
            return [];
        }
        return plain.items.map(item => ChatRoom.parse(item));
    }
    static parse(plain) {
        return new ChatRoom({
            uuid: plain.uuid,
            name: plain.name,
            users: plain.users,
        });
    }
    static newFrom(room) {
        return (0, new_from_1.default)(room, ChatRoom);
    }
    constructor({ uuid, name, users, } = {}) {
        this.uuid = uuid;
        this.name = name;
        this.users = users;
        // Useful to compare instead of instanceof with minified code
        this.type = 'ChatRoom';
    }
}
exports.default = ChatRoom;
