"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
class Emitter {
    constructor() {
        this.eventEmitter = new events_1.default();
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
exports.default = Emitter;
