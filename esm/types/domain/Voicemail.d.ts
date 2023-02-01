type MessageResponse = {
    caller_id_name: string;
    caller_id_num: string;
    duration: number;
    id: string;
    folder?: Record<string, any>;
    timestamp: number;
};
export type Response = {
    id: string;
    name: string;
    number: string;
    folders: Array<{
        id: string;
        name: string;
        type: string;
        messages: Array<MessageResponse>;
    }>;
};
type VoicemailArguments = {
    id: string;
    date: Date;
    duration: number;
    caller: {
        name: string;
        number: string;
    };
    unread?: boolean | null | undefined;
};
export default class Voicemail {
    type: string;
    id: string;
    date: Date;
    duration: number;
    unread: boolean | null | undefined;
    caller: {
        name: string;
        number: string;
    };
    static parse(plain: MessageResponse): Voicemail;
    static parseMany(plain: Response): Array<Voicemail>;
    static newFrom(profile: Voicemail): any;
    constructor({ id, date, duration, caller, unread, }: VoicemailArguments);
    is(other: Voicemail): boolean;
    acknowledge(): this;
    makeAsUnRead(): this;
    contains(query: string): boolean;
}
export {};
//# sourceMappingURL=Voicemail.d.ts.map