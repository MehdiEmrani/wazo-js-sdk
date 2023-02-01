export default class MeetingStatus {
    type;
    full;
    constructor({ full, } = {}) {
        this.full = full;
        // Useful to compare instead of instanceof with minified code
        this.type = 'MeetingStatus';
    }
    static parse(plain) {
        return new MeetingStatus({
            full: plain.full,
        });
    }
}
