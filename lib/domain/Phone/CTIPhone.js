"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSFER_FLOW_BLIND = exports.TRANSFER_FLOW_ATTENDED = void 0;
const CallSession_1 = __importDefault(require("../CallSession"));
const Emitter_1 = __importDefault(require("../../utils/Emitter"));
const CallApi_1 = __importDefault(require("../../service/CallApi"));
const IssueReporter_1 = __importDefault(require("../../service/IssueReporter"));
exports.TRANSFER_FLOW_ATTENDED = 'attended';
exports.TRANSFER_FLOW_BLIND = 'blind';
// const MINIMUM_WAZO_ENGINE_VERSION_FOR_CTI_HOLD = '20.11';
const logger = IssueReporter_1.default ? IssueReporter_1.default.loggerFor('cti-phone') : console;
class CTIPhone extends Emitter_1.default {
    constructor(session, isMobile = false, callbackAllLines = false) {
        super();
        logger.info('CTI Phone created');
        this.session = session;
        this.isMobile = isMobile;
        this.callbackAllLines = callbackAllLines;
    }
    getOptions() {
        // @FIXME: temporarily disabling this option
        // const hold = this.session.hasEngineVersionGte(MINIMUM_WAZO_ENGINE_VERSION_FOR_CTI_HOLD);
        return {
            accept: false,
            decline: true,
            mute: true,
            hold: false,
            transfer: true,
            sendKey: true,
            addParticipant: false,
            record: true,
            merge: false,
        };
    }
    hasAnActiveCall() {
        return !!this.currentCall;
    }
    callCount() {
        return this.currentCall ? 1 : 0;
    }
    isWebRTC() {
        return false;
    }
    getUserAgent() {
        return 'cti-phone';
    }
    startHeartbeat() { }
    setOnHeartbeatTimeout() { }
    setOnHeartbeatCallback() { }
    stopHeartbeat() { }
    bindClientEvents() { }
    onConnect() { }
    onDisconnect() { }
    makeCall(number, line) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('make CTI call', {
                number,
            });
            if (!number) {
                return null;
            }
            try {
                this.currentCall = yield CallApi_1.default.makeCall(line, number, this.isMobile, this.callbackAllLines);
            }
            catch (_) { // We have to deal with error like `User has no mobile phone number` error in the UI.
            }
            if (!this.currentCall) {
                return null;
            }
            const callSession = CallSession_1.default.parseCall(this.currentCall);
            this.eventEmitter.emit('onCallOutgoing', callSession);
            return callSession;
        });
    }
    accept(callSession) {
        if (!callSession) {
            return Promise.resolve(null);
        }
        logger.info('accept CTI call', {
            callId: callSession.getId(),
            number: callSession.number,
        });
        if (!this.currentCall) {
            this.currentCall = callSession.call;
        }
        return Promise.resolve(callSession.getId());
    }
    endCurrentCall(callSession) {
        if (!callSession) {
            return;
        }
        logger.info('end current CTI call', {
            callId: callSession.getId(),
            number: callSession.number,
        });
        this.currentCall = undefined;
        this.eventEmitter.emit('onCallEnded', callSession);
    }
    hangup(callSession) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!callSession) {
                return Promise.resolve(false);
            }
            logger.info('hangup CTI call', {
                callId: callSession.getId(),
                number: callSession.number,
            });
            try {
                yield CallApi_1.default.cancelCall(callSession);
                if (this.currentCall && callSession.callId === this.currentCall.id) {
                    this.endCurrentCall(callSession);
                }
                this.eventEmitter.emit('onCallEnded', callSession);
                return true;
            }
            catch (e) {
                logger.error('hangup CTI call, error', e);
                this.eventEmitter.emit('onCallFailed', callSession);
                return false;
            }
        });
    }
    ignore() { }
    reject(callSession) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!callSession) {
                return;
            }
            logger.info('reject CTI call', {
                callId: callSession.getId(),
                number: callSession.number,
            });
            yield CallApi_1.default.cancelCall(callSession);
            this.eventEmitter.emit('onCallEnded', callSession);
        });
    }
    transfer(callSession, number) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!callSession) {
                return;
            }
            logger.info('transfer CTI call', {
                callId: callSession.getId(),
                number: callSession.number,
                to: number,
            });
            yield CallApi_1.default.transferCall(callSession.callId, number, exports.TRANSFER_FLOW_BLIND);
        });
    }
    indirectTransfer() {
        return Promise.resolve(false);
    }
    initiateCTIIndirectTransfer(callSession, number) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!callSession) {
                return;
            }
            logger.info('indirect CTI transfer', {
                callId: callSession.getId(),
                number: callSession.number,
                to: number,
            });
            return CallApi_1.default.transferCall(callSession.callId, number, exports.TRANSFER_FLOW_ATTENDED);
        });
    }
    cancelCTIIndirectTransfer(transferId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('cancel CTI transfer', {
                transferId,
            });
            return CallApi_1.default.cancelCallTransfer(transferId);
        });
    }
    confirmCTIIndirectTransfer(transferId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('confirm CTI transfer', {
                transferId,
            });
            return CallApi_1.default.confirmCallTransfer(transferId);
        });
    }
    sendKey(callSession, digits) {
        if (!callSession) {
            return;
        }
        logger.info('send CTI key', {
            callId: callSession.getId(),
            number: callSession.number,
            digits,
        });
        CallApi_1.default.sendDTMF(callSession.callId, digits);
    }
    onConnectionMade() {
        logger.info('on CTI connection made');
        this.eventEmitter.emit('onCallAccepted');
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('CTI close');
            return Promise.resolve();
        });
    }
    hold(callSession) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!callSession) {
                return false;
            }
            logger.info('CTI hold', {
                callId: callSession.getId(),
                number: callSession.number,
            });
            return CallApi_1.default.hold(callSession.callId);
        });
    }
    resume(callSession) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!callSession) {
                return false;
            }
            logger.info('CTI resume', {
                callId: callSession.getId(),
                number: callSession.number,
            });
            return CallApi_1.default.resume(callSession.callId);
        });
    }
    mute(callSession) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!callSession) {
                return;
            }
            logger.info('CTI mute', {
                callId: callSession.getId(),
                number: callSession.number,
            });
            yield CallApi_1.default.mute(callSession.callId);
        });
    }
    unmute(callSession) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!callSession) {
                return;
            }
            logger.info('CTI unmute', {
                callId: callSession.getId(),
                number: callSession.number,
            });
            yield CallApi_1.default.unmute(callSession.callId);
        });
    }
    putOnSpeaker() { }
    putOffSpeaker() { }
    turnCameraOff() { }
    turnCameraOn() { }
    changeAudioInputDevice() { return Promise.resolve(null); }
    changeVideoInputDevice() { return Promise.resolve(null); }
    changeAudioDevice() { }
    changeRingDevice() { }
    changeAudioVolume() { }
    changeRingVolume() { }
    hasVideo() {
        return false;
    }
    hasAVideoTrack() {
        return false;
    }
    getLocalStreamForCall() {
        return null;
    }
    getRemoteStreamForCall() {
        return null;
    }
    getLocalVideoStream() {
        return null;
    }
    setActiveSipSession() { }
    isRegistered() {
        return true;
    }
    hasIncomingCallSession() {
        return true;
    }
    hasActiveRemoteVideoStream() {
        return false;
    }
    getCurrentCallSession() {
        return this.currentCall ? CallSession_1.default.parseCall(this.currentCall) : null;
    }
    enableRinging() { }
    sendMessage() { }
    disableRinging() { }
    getLocalStream() {
        return null;
    }
    getRemoteStream() {
        return null;
    }
    getRemoteVideoStream() {
        return null;
    }
    getRemoteAudioStream() {
        return null;
    }
    hasLocalVideo() {
        return false;
    }
    useLocalVideoElement() { }
    setMediaConstraints() { }
}
exports.default = CTIPhone;
