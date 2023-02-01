"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Relocation {
    static parse(response) {
        return new Relocation({
            initiatorCall: response.initiator_call,
            recipientCall: response.recipient_call,
            relocatedCall: response.relocated_call,
        });
    }
    constructor({ relocatedCall, initiatorCall, recipientCall, }) {
        this.initiatorCall = initiatorCall || '';
        this.relocatedCall = relocatedCall || '';
        this.recipientCall = recipientCall || '';
    }
}
Relocation.MIN_ENGINE_VERSION_REQUIRED = '19.09';
exports.default = Relocation;
