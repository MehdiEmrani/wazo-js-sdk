type Response = {
    destination: string;
    enabled: boolean;
};
export declare const FORWARD_KEYS: {
    BUSY: string;
    NO_ANSWER: string;
    UNCONDITIONAL: string;
};
type ForwardOptionArguments = {
    destination?: string;
    enabled?: boolean;
    key?: string;
};
export default class ForwardOption {
    destination: string | undefined;
    enabled: boolean | undefined;
    key: string | undefined;
    static parse(plain: Response, key: string): ForwardOption;
    static newFrom(profile: ForwardOption): any;
    constructor({ destination, enabled, key, }?: ForwardOptionArguments);
    setDestination(number: string): ForwardOption;
    setEnabled(enabled: boolean): ForwardOption;
    is(other: ForwardOption): boolean;
}
export {};
//# sourceMappingURL=ForwardOption.d.ts.map