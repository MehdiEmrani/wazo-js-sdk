/* global document */
import Wazo from '../index';
class Stream {
    htmlStream;
    participant;
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
        const isLocal = this.participant instanceof Wazo.LocalParticipant;
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
export default Stream;
