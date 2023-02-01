import { SessionState } from 'sip.js/lib/api/session-state';
import newFrom from '../utils/new-from';
import updateFrom from '../utils/update-from';
export default class CallSession {
    call;
    // Wazo's callId, like `1594062407.xxxx`
    callId;
    displayName;
    // Used to retrieve the real callee when doing indirect transfer
    realDisplayName;
    updatedNumber;
    number;
    callerNumber;
    creationTime;
    startTime; // = creationTime
    answerTime;
    endTime;
    isCaller;
    answeredBySystem;
    dialedExtension;
    ringing;
    // Should be computed ?
    paused;
    // Asterisk callId, like `7aed6793-4405-466d-873e-92d21c2fef9f`
    sipCallId;
    sipStatus;
    muted;
    videoMuted;
    videoRemotelyDowngraded;
    cameraEnabled;
    autoAnswer;
    ignored;
    screensharing;
    type;
    recording;
    recordingPaused;
    sipSession;
    conference;
    constructor({ answered, answeredBySystem, isCaller, displayName, callId, muted, videoMuted, number, paused, ringing, startTime, creationTime, endTime, cameraEnabled, dialedExtension, sipCallId, sipStatus, callerNumber, call, autoAnswer, ignored, screensharing, recording, recordingPaused, videoRemotelyDowngraded, sipSession, answerTime, conference, }) {
        this.callId = callId;
        this.sipCallId = sipCallId;
        this.displayName = displayName;
        this.number = number;
        this.creationTime = creationTime;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isCaller = isCaller;
        this.answered = answered;
        this.answeredBySystem = answeredBySystem;
        this.ringing = ringing;
        this.paused = paused;
        this.muted = muted;
        this.videoMuted = videoMuted;
        this.callerNumber = callerNumber;
        this.cameraEnabled = cameraEnabled;
        this.dialedExtension = dialedExtension || '';
        this.call = call;
        this.sipStatus = sipStatus;
        this.autoAnswer = autoAnswer || false;
        this.ignored = ignored || false;
        this.screensharing = screensharing || false;
        this.recording = recording || false;
        this.recordingPaused = recordingPaused || false;
        this.videoRemotelyDowngraded = videoRemotelyDowngraded;
        this.sipSession = sipSession;
        this.answerTime = answerTime || this.answerTime;
        this.conference = conference;
        // Useful to compare instead of instanceof with minified code
        this.type = 'CallSession';
    }
    resume() {
        this.paused = false;
    }
    hold() {
        this.paused = true;
    }
    mute() {
        this.muted = true;
    }
    unmute() {
        this.muted = false;
    }
    muteVideo() {
        this.videoMuted = true;
    }
    unmuteVideo() {
        this.videoMuted = false;
    }
    answer() {
        this.answerTime = new Date();
    }
    systemAnswer() {
        this.answeredBySystem = true;
    }
    enableCamera() {
        this.cameraEnabled = true;
    }
    disableCamera() {
        this.cameraEnabled = false;
    }
    ignore() {
        this.ignored = true;
    }
    startScreenSharing() {
        this.screensharing = true;
    }
    stopScreenSharing() {
        this.screensharing = false;
    }
    setIsConference(conference) {
        this.conference = conference;
    }
    isIncoming() {
        return !this.isCaller && !this.answered;
    }
    isOutgoing() {
        return this.isCaller && !this.answered;
    }
    isActive() {
        return this.answered || this.isOutgoing();
    }
    isAnswered() {
        return this.answered;
    }
    isAnsweredBySystem() {
        return this.answeredBySystem;
    }
    isRinging() {
        return this.ringing;
    }
    isOnHold() {
        return this.paused;
    }
    isMuted() {
        return this.muted;
    }
    isVideoMuted() {
        return this.videoMuted;
    }
    isCameraEnabled() {
        return this.cameraEnabled;
    }
    isIgnored() {
        return this.ignored;
    }
    isScreenSharing() {
        return this.screensharing;
    }
    isRecording() {
        return this.recording;
    }
    recordingIsPaused() {
        return this.recordingPaused;
    }
    hasAnInitialInterceptionNumber() {
        return this.number.startsWith('*8');
    }
    isAnInterception() {
        return this.dialedExtension.startsWith('*8');
    }
    isEstablished() {
        return this.sipStatus === SessionState.Established;
    }
    isTerminating() {
        return this.sipStatus === SessionState.Terminating;
    }
    isTerminated() {
        return this.sipStatus === SessionState.Terminated;
    }
    isConference() {
        return this.conference;
    }
    getElapsedTimeInSeconds() {
        if (!this.startTime) {
            return 0;
        }
        return (Date.now() - this.startTime) / 1000;
    }
    getId() {
        return this.sipCallId || this.callId;
    }
    is(callSession) {
        if (!callSession) {
            return false;
        }
        return this.isId(callSession.sipCallId) || this.isId(callSession.callId);
    }
    isId(id) {
        return this.getId() === id || (!!this.sipCallId && this.sipCallId === id) || (!!this.callId && this.callId === id);
    }
    updateFrom(session) {
        updateFrom(this, session);
    }
    separateDisplayName() {
        const names = this.displayName.split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' ');
        return {
            firstName,
            lastName,
        };
    }
    getTalkingToIds() {
        return this.call ? this.call.talkingToIds : [];
    }
    setVideoRemotelyDowngraded(value) {
        this.videoRemotelyDowngraded = value;
    }
    isVideoRemotelyDowngraded() {
        return this.videoRemotelyDowngraded;
    }
    static newFrom(callSession) {
        return newFrom(callSession, CallSession);
    }
    // Retro-compatibility: `answered` was a boolean before. We can reproduce the behaviour with a getter/setter
    set answered(value) {
        this.answerTime = value ? this.answerTime || new Date() : null;
    }
    get answered() {
        return !!this.answerTime;
    }
    toJSON() {
        const jsonObj = { ...this,
        };
        jsonObj.answered = this.answered;
        return jsonObj;
    }
    static parseCall(call) {
        return new CallSession({
            callId: call.id,
            sipCallId: call.sipCallId,
            displayName: call.calleeName || call.calleeNumber,
            number: call.calleeNumber,
            callerNumber: call.callerNumber,
            startTime: +call.startingTime,
            paused: call.isOnHold(),
            isCaller: call.isCaller,
            muted: call.muted,
            videoMuted: false,
            screensharing: false,
            recording: call.isRecording(),
            recordingPaused: false,
            // @TODO
            ringing: call.isRinging(),
            answered: call.isUp(),
            answeredBySystem: call.isUp() && call.talkingToIds.length === 0,
            cameraEnabled: call.isVideo,
            dialedExtension: call.dialedExtension,
            call,
            conference: false, // @FIXME?
        });
    }
}
