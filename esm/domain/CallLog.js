import moment from 'moment';
import newFrom from '../utils/new-from';
import Recording from './Recording';
export default class CallLog {
    type;
    answer;
    answered;
    newMissedCall;
    callDirection;
    destination;
    recordings;
    source;
    id;
    duration;
    start;
    end;
    static merge(current, toMerge) {
        const onlyUnique = (value, index, self) => self.indexOf(value) === index;
        const allLogs = current.concat(toMerge);
        const onlyUniqueIds = allLogs.map(c => c.id).filter(onlyUnique);
        return onlyUniqueIds.map(id => allLogs.find(log => log && log.id === id));
    }
    static parseMany(plain) {
        if (!plain || !plain.items) {
            return [];
        }
        return plain.items.map(item => CallLog.parse(item));
    }
    static parse(plain) {
        return new CallLog({
            answer: plain.answer ? moment(plain.answer).toDate() : null,
            answered: plain.answered,
            callDirection: plain.call_direction,
            destination: {
                // @TEMP: Temporarily assuming empty numbers are meetings
                // which is admittedly a very dangerous assumption. Did i mention it was temporary?
                extension: plain.requested_extension || plain.destination_extension || `meeting-${plain.requested_name || plain.destination_name || ''}`,
                name: plain.requested_name || plain.destination_name || '',
                uuid: plain.destination_user_uuid,
            },
            source: {
                extension: plain.source_extension,
                name: plain.source_name,
                uuid: plain.source_user_uuid,
            },
            id: plain.id,
            duration: (plain.duration || 0) * 1000,
            // duration is in seconds
            start: moment(plain.start).toDate(),
            end: plain.end ? moment(plain.end).toDate() : null,
            recordings: Recording.parseMany(plain.recordings || []),
        });
    }
    static parseNew(plain, session) {
        const callLog = CallLog.parse(plain);
        // @TODO: FIXME add verification declined vs missed call
        callLog.newMissedCall = session && session.hasExtension(plain.requested_extension || plain.destination_extension) && !plain.answered;
        return callLog;
    }
    static newFrom(profile) {
        return newFrom(profile, CallLog);
    }
    constructor({ answer, answered, callDirection, destination, source, id, duration, start, end, recordings, }) {
        this.answer = answer;
        this.answered = answered;
        this.callDirection = callDirection;
        this.destination = destination;
        this.source = source;
        this.id = id;
        this.duration = duration;
        this.start = start;
        this.end = end;
        this.recordings = recordings || [];
        // Useful to compare instead of instanceof with minified code
        this.type = 'CallLog';
    }
    isFromSameParty(other, session) {
        return this.theOtherParty(session).extension === other.theOtherParty(session).extension;
    }
    theOtherParty(session) {
        if (this.callDirection === 'inbound') {
            return this.source;
        }
        if (this.callDirection === 'outbound') {
            return this.destination;
        }
        return session && session.hasExtension(this.source.extension) ? this.destination : this.source;
    }
    isNewMissedCall() {
        return this.newMissedCall;
    }
    acknowledgeCall() {
        this.newMissedCall = false;
        return this;
    }
    isAcknowledged() {
        return this.newMissedCall;
    }
    isAnswered() {
        return this.answered;
    }
    isOutgoing(session) {
        if (this.callDirection === 'internal') {
            return session.hasExtension(this.source.extension);
        }
        return this.callDirection === 'outbound';
    }
    isIncoming(session) {
        if (this.callDirection === 'internal') {
            return session.hasExtension(this.destination.extension);
        }
        return this.callDirection === 'inbound';
    }
    isAnOutgoingCall(session) {
        console.warn(`@wazo/sdk 
      CallLog.isAnOutgoingcall(session) method is obsolete.
      Please use CallLog.isOutgoing(session).
    `);
        return session.hasExtension(this.source.extension) && this.answered;
    }
    isAMissedOutgoingCall(session) {
        return session.hasExtension(this.source.extension) && !this.answered;
    }
    isAnIncomingCall(session) {
        console.warn(`@wazo/sdk
      CallLog.isAnIncomingCall(session) method is obsolete.
      Please use CallLog.isIncoming(session).
    `);
        return session.hasExtension(this.destination.extension) && this.answered;
    }
    isADeclinedCall(session) {
        return !this.answered && session.hasExtension(this.destination.extension);
    }
    getRecordings() {
        return this.recordings;
    }
}
