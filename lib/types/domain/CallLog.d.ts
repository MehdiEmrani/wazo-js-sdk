import Session from './Session';
import type { RecordingResponse } from './Recording';
import Recording from './Recording';
type CallLogResponse = {
    answer: string | null | undefined;
    answered: boolean;
    call_direction: string;
    destination_extension: string;
    destination_name: string | null | undefined;
    destination_user_uuid: string | null | undefined;
    duration: number;
    end: string | null | undefined;
    id: number;
    source_extension: string;
    source_name: string;
    source_user_uuid: string | null | undefined;
    recordings: RecordingResponse[];
    requested_extension: string;
    requested_name: string;
    start: string;
};
type Response = {
    filtered: number;
    items: Array<CallLogResponse>;
    total: number;
};
type CallLogArguments = {
    answer: Date | null | undefined;
    answered: boolean;
    newMissedCall?: boolean;
    callDirection: string;
    destination: {
        extension: string;
        name: string;
        uuid: string | null | undefined;
    };
    source: {
        extension: string;
        name: string;
        uuid: string | null | undefined;
    };
    id: number;
    duration: number;
    start: Date;
    end: Date | null | undefined;
    recordings: Recording[];
};
export default class CallLog {
    type: string;
    answer: Date | null | undefined;
    answered: boolean;
    newMissedCall: boolean;
    callDirection: string;
    destination: {
        extension: string;
        name: string;
    };
    recordings: Recording[];
    source: {
        extension: string;
        name: string;
    };
    id: number;
    duration: number;
    start: Date;
    end: Date | null | undefined;
    static merge(current: Array<CallLog>, toMerge: Array<CallLog>): Array<CallLog | null | undefined>;
    static parseMany(plain: Response): Array<CallLog>;
    static parse(plain: CallLogResponse): CallLog;
    static parseNew(plain: CallLogResponse, session: Session): CallLog;
    static newFrom(profile: CallLog): any;
    constructor({ answer, answered, callDirection, destination, source, id, duration, start, end, recordings, }: CallLogArguments);
    isFromSameParty(other: CallLog, session: Session): boolean;
    theOtherParty(session: Session): {
        extension: string;
        name: string;
    };
    isNewMissedCall(): boolean;
    acknowledgeCall(): CallLog;
    isAcknowledged(): boolean;
    isAnswered(): boolean;
    isOutgoing(session: Session): boolean;
    isIncoming(session: Session): boolean;
    isAnOutgoingCall(session: Session): boolean;
    isAMissedOutgoingCall(session: Session): boolean;
    isAnIncomingCall(session: Session): boolean;
    isADeclinedCall(session: Session): boolean;
    getRecordings(): Recording[];
}
export {};
//# sourceMappingURL=CallLog.d.ts.map