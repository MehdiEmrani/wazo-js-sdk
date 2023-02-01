"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const new_from_1 = __importDefault(require("../utils/new-from"));
class Voicemail {
    static parse(plain) {
        return new Voicemail({
            id: plain.id,
            date: (0, moment_1.default)(plain.timestamp * 1000).toDate(),
            duration: plain.duration * 1000,
            caller: {
                name: plain.caller_id_name,
                number: plain.caller_id_num,
            },
            unread: plain.folder ? plain.folder.type === 'new' : null,
        });
    }
    static parseMany(plain) {
        if (!plain) {
            return [];
        }
        const plainUnread = plain.folders.filter(folder => folder.type === 'new')[0].messages;
        const plainRead = plain.folders.filter(folder => folder.type === 'old')[0].messages;
        const unread = plainUnread.map(message => Voicemail.parse(message)).map(voicemail => voicemail.makeAsUnRead());
        const read = plainRead.map(message => Voicemail.parse(message)).map(voicemail => voicemail.acknowledge());
        return [...unread, ...read];
    }
    static newFrom(profile) {
        return (0, new_from_1.default)(profile, Voicemail);
    }
    constructor({ id, date, duration, caller, unread, }) {
        this.id = id;
        this.date = date;
        this.duration = duration;
        this.caller = caller;
        this.unread = unread;
        // Useful to compare instead of instanceof with minified code
        this.type = 'Voicemail';
    }
    is(other) {
        return other && this.id === other.id;
    }
    acknowledge() {
        this.unread = false;
        return this;
    }
    makeAsUnRead() {
        this.unread = true;
        return this;
    }
    contains(query) {
        if (!query) {
            return true;
        }
        return this.caller.name.toUpperCase().includes(query.toUpperCase()) || this.caller.number.includes(query);
    }
}
exports.default = Voicemail;
