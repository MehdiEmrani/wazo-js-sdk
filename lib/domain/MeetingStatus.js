"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MeetingStatus {
    constructor({ full, } = {}) {
        this.full = full;
        // Useful to compare instead of instanceof with minified code
        this.type = 'MeetingStatus';
    }
    static parse(plain) {
        return new MeetingStatus({
            full: plain.full,
        });
    }
}
exports.default = MeetingStatus;
