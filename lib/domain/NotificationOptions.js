"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const new_from_1 = __importDefault(require("../utils/new-from"));
class NotificationOptions {
    static parse(plain) {
        if (!plain) {
            return new NotificationOptions({
                sound: true,
                vibration: true,
            });
        }
        return new NotificationOptions({
            sound: plain.sound,
            vibration: plain.vibration,
        });
    }
    static newFrom(profile) {
        return (0, new_from_1.default)(profile, NotificationOptions);
    }
    constructor({ sound, vibration, } = { sound: true, vibration: true }) {
        this.sound = sound;
        this.vibration = vibration;
    }
    setSound(sound) {
        this.sound = sound;
        return this;
    }
    setVibration(vibration) {
        this.vibration = vibration;
        return this;
    }
    enable() {
        this.vibration = true;
        this.sound = true;
        return this;
    }
    disable() {
        this.vibration = false;
        this.sound = false;
        return this;
    }
    isEnabled() {
        return this.sound || this.vibration;
    }
}
exports.default = NotificationOptions;
