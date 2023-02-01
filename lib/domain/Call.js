"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const new_from_1 = __importDefault(require("../utils/new-from"));
const RECORD_STATE_ACTIVE = 'active';
class Call {
    static parseMany(plain) {
        if (!plain) {
            return [];
        }
        return plain.map((plainCall) => Call.parse(plainCall));
    }
    static parse(plain) {
        return new Call({
            id: plain.call_id,
            sipCallId: plain.sip_call_id,
            callerName: plain.caller_id_name,
            callerNumber: plain.caller_id_number,
            calleeName: plain.peer_caller_id_name,
            calleeNumber: plain.peer_caller_id_number,
            dialedExtension: plain.dialed_extension,
            isCaller: plain.is_caller,
            isVideo: plain.is_video,
            muted: plain.muted,
            onHold: plain.on_hold,
            status: plain.status,
            lineId: plain.line_id,
            startingTime: (0, moment_1.default)(plain.creation_time).toDate(),
            talkingToIds: Object.keys(plain.talking_to || {}),
            recording: plain.record_state === RECORD_STATE_ACTIVE,
        });
    }
    static newFrom(call) {
        return (0, new_from_1.default)(call, Call);
    }
    constructor({ id, sipCallId, callerName, callerNumber, calleeName, calleeNumber, dialedExtension, isCaller, isVideo, lineId, muted, onHold, status, startingTime, talkingToIds, recording, }) {
        this.id = id;
        this.sipCallId = sipCallId;
        this.callerName = callerName;
        this.callerNumber = callerNumber;
        this.calleeName = calleeName;
        this.calleeNumber = calleeNumber;
        this.dialedExtension = dialedExtension;
        this.muted = muted;
        this.onHold = onHold;
        this.isCaller = isCaller;
        this.lineId = lineId;
        this.status = status;
        this.startingTime = startingTime;
        this.talkingToIds = talkingToIds || [];
        this.recording = recording;
        this.isVideo = !!isVideo;
        // Useful to compare instead of instanceof with minified code
        this.type = 'Call';
    }
    getElapsedTimeInSeconds() {
        const now = Date.now();
        return (now - +this.startingTime) / 1000;
    }
    separateCalleeName() {
        const names = this.calleeName.split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' ');
        return {
            firstName,
            lastName,
        };
    }
    is(other) {
        return !!other && this.id === other.id;
    }
    hasACalleeName() {
        return this.calleeName.length > 0;
    }
    hasNumber(number) {
        return this.calleeNumber === number;
    }
    isUp() {
        return this.status === 'Up';
    }
    isDown() {
        return this.status === 'Down';
    }
    isRinging() {
        return this.isRingingIncoming() || this.isRingingOutgoing();
    }
    isRingingIncoming() {
        return this.status === 'Ringing';
    }
    isRingingOutgoing() {
        return this.status === 'Ring';
    }
    isFromTransfer() {
        return this.status === 'Down' || this.status === 'Ringing';
    }
    isOnHold() {
        return this.onHold;
    }
    putOnHold() {
        this.onHold = true;
    }
    resume() {
        this.onHold = false;
    }
    isRecording() {
        return this.recording;
    }
}
exports.default = Call;
