"use strict";
/* global document */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
class Stream {
    static detachStream(stream) {
        stream.getTracks().forEach((track) => {
            track.stop();
        });
    }
    constructor(htmlStream, participant) {
        this.htmlStream = htmlStream;
        this.participant = participant;
    }
    attach(rawElement) {
        const element = rawElement || document.createElement('video');
        const isLocal = this.participant instanceof index_1.default.LocalParticipant;
        element.autoplay = true;
        element.srcObject = this.htmlStream;
        element.muted = isLocal;
        if (isLocal) {
            // Reverse local video
            element.style.transform = 'scale(-1, 1)';
        }
        element.onloadedmetadata = () => {
            const tracks = this.htmlStream ? this.htmlStream.getVideoTracks() : [];
            tracks.forEach(track => {
                track.enabled = true;
                // @ts-ignore
                track.loaded = true;
            });
        };
        return element;
    }
    detach() {
        Stream.detachStream(this.htmlStream);
    }
    hasVideo() {
        if (!this.htmlStream) {
            return false;
        }
        return this.htmlStream.getTracks().some(track => track.kind === 'video' && track.readyState !== 'ended');
    }
    get id() {
        return this.htmlStream ? this.htmlStream.id : null;
    }
}
exports.default = Stream;
