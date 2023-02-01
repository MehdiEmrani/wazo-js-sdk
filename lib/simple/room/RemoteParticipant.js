"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Participant_1 = __importDefault(require("./Participant"));
class RemoteParticipant extends Participant_1.default {
    constructor(room, rawParticipant, extra = {}) {
        super(room, rawParticipant, extra);
        if (this.name === '<unknown>') {
            this.name = String(this.number);
        }
    }
}
exports.default = RemoteParticipant;
