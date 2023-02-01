"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const new_from_1 = __importDefault(require("../utils/new-from"));
const update_from_1 = __importDefault(require("../utils/update-from"));
class SwitchboardCall {
    static parse(plain) {
        return new SwitchboardCall({
            id: plain.id,
            callSession: plain.callSession || null,
            callerIdName: plain.caller_id_name || null,
            callerIdNumber: plain.caller_id_number || null,
            participantId: plain.participantId || null,
            answerTime: plain.startTime,
            state: plain.state,
            switchboardName: plain.switchboardName,
            switchboardUuid: plain.switchboardUuid,
        });
    }
    constructor({ id, callSession, callerIdName, callerIdNumber, participantId, answerTime, state, switchboardName, switchboardUuid, }) {
        this.id = id;
        this.callSession = callSession;
        this.callerIdName = callerIdName;
        this.callerIdNumber = callerIdNumber;
        this.participantId = participantId;
        this.answerTime = answerTime;
        this.state = state;
        this.switchboardName = switchboardName;
        this.switchboardUuid = switchboardUuid;
        // Useful to compare instead of instanceof with minified code
        this.type = 'SwitchboardCall';
    }
    updateFrom(switchboardCall) {
        (0, update_from_1.default)(this, switchboardCall);
    }
    getId() {
        return this.id;
    }
    static newFrom(switchboardCall) {
        return (0, new_from_1.default)(switchboardCall, SwitchboardCall);
    }
}
SwitchboardCall.STATE = {
    INCOMING: 'incoming',
    ONGOING: 'ongoing',
    HELD: 'held',
};
exports.default = SwitchboardCall;
