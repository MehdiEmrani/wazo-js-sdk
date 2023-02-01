import newFrom from '../utils/new-from';
export default class NotificationOptions {
    sound;
    vibration;
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
        return newFrom(profile, NotificationOptions);
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
