"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SFUNotAvailableError extends Error {
    constructor(message = 'Sorry your user is not configured to support video conference') {
        super(message);
        this.name = 'SFUNotAvailableError';
    }
}
exports.default = SFUNotAvailableError;
