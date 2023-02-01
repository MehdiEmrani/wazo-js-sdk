"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
class Recording {
    static parseMany(recordings = []) {
        if (!recordings) {
            return [];
        }
        return recordings.map(item => Recording.parse(item));
    }
    static parse(plain) {
        return new Recording({
            deleted: plain.deleted,
            fileName: plain.filename,
            end: plain.end_time ? (0, moment_1.default)(plain.end_time).toDate() : null,
            start: (0, moment_1.default)(plain.start_time).toDate(),
            uuid: plain.uuid,
        });
    }
    constructor({ deleted, end, fileName, start, uuid, }) {
        this.deleted = deleted;
        this.end = end;
        this.fileName = fileName;
        this.start = start;
        this.uuid = uuid;
    }
}
exports.default = Recording;
