class Agent {
    context;
    extension;
    id;
    logged;
    number;
    paused;
    pausedReason;
    static parse(plain) {
        return new Agent({
            context: plain.context,
            extension: plain.extension,
            id: plain.id,
            logged: plain.logged,
            number: plain.number,
            paused: plain.paused,
            pausedReason: plain.paused_reason,
        });
    }
    constructor({ context, extension, id, logged, number, paused, pausedReason, }) {
        this.context = context;
        this.extension = extension;
        this.id = id;
        this.logged = logged;
        this.number = number;
        this.paused = paused;
        this.pausedReason = pausedReason;
    }
}
export default Agent;
