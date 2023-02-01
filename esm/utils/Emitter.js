import EventEmitter from 'events';
export default class Emitter {
    eventEmitter;
    constructor() {
        this.eventEmitter = new EventEmitter();
    }
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }
    once(event, callback) {
        this.eventEmitter.once(event, callback);
    }
    off(event, callback) {
        this.eventEmitter.removeListener(event, callback);
    }
    unbind() {
        this.eventEmitter.removeAllListeners();
    }
}
