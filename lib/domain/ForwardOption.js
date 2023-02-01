"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORWARD_KEYS = void 0;
const new_from_1 = __importDefault(require("../utils/new-from"));
exports.FORWARD_KEYS = {
    BUSY: 'busy',
    NO_ANSWER: 'noanswer',
    UNCONDITIONAL: 'unconditional',
};
class ForwardOption {
    static parse(plain, key) {
        return new ForwardOption({
            destination: plain.destination || '',
            enabled: plain.enabled,
            key,
        });
    }
    static newFrom(profile) {
        return (0, new_from_1.default)(profile, ForwardOption);
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
exports.default = ForwardOption;
