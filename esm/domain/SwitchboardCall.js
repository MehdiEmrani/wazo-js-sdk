import newFrom from '../utils/new-from';
import updateFrom from '../utils/update-from';
class SwitchboardCall {
    static STATE;
    id;
    callSession;
    callerIdName;
    callerIdNumber;
    answerTime;
    participantId;
    state;
    switchboardName;
    switchboardUuid;
    type;
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
        updateFrom(this, switchboardCall);
    }
    getId() {
        return this.id;
    }
    static newFrom(switchboardCall) {
        return newFrom(switchboardCall, SwitchboardCall);
    }
}
SwitchboardCall.STATE = {
    INCOMING: 'incoming',
    ONGOING: 'ongoing',
    HELD: 'held',
};
export default SwitchboardCall;
