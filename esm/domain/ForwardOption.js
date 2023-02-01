import newFrom from '../utils/new-from';
export const FORWARD_KEYS = {
    BUSY: 'busy',
    NO_ANSWER: 'noanswer',
    UNCONDITIONAL: 'unconditional',
};
export default class ForwardOption {
    destination;
    enabled;
    key;
    static parse(plain, key) {
        return new ForwardOption({
            destination: plain.destination || '',
            enabled: plain.enabled,
            key,
        });
    }
    static newFrom(profile) {
        return newFrom(profile, ForwardOption);
    }
    constructor({ destination, enabled, key, } = {}) {
        this.destination = destination;
        this.enabled = enabled;
        this.key = key;
    }
    setDestination(number) {
        this.destination = number;
        return this;
    }
    setEnabled(enabled) {
        this.enabled = enabled;
        return this;
    }
    is(other) {
        return this.key === other.key;
    }
}
