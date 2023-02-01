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
const IssueReporter_1 = __importDefault(require("../../service/IssueReporter"));
const index_1 = __importDefault(require("../index"));
const Room_1 = __importDefault(require("./Room"));
const logger = IssueReporter_1.default.loggerFor('sdk-sip-room');
class SipRoom extends Room_1.default {
    static connect({ extension, constraints, audioOnly = false, extra, room, }) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('connecting to sip room', {
                extension,
                audioOnly,
                room: !!room,
            });
            if (!room) {
                yield index_1.default.Phone.connect({
                    media: constraints,
                });
                const withCamera = constraints && !!constraints.video;
                const callSession = yield index_1.default.Phone.call(extension, withCamera, null, audioOnly, true);
                // eslint-disable-next-line no-param-reassign
                room = new SipRoom(callSession, extension, null, null, extra);
            }
            if (room && room.callSession && room.callSession.call) {
                room.setCallId(room.callSession.call.id);
            }
            logger.info('connected to room', {
                extension: room.extension,
            });
            return room;
        });
    }
    mute() {
        logger.info('mute sip room');
        index_1.default.Phone.mute(this.callSession, false);
        this.sendMuteStatus();
    }
    unmute() {
        logger.info('unmute sip room');
        index_1.default.Phone.unmute(this.callSession, false);
        this.sendUnMuteStatus();
    }
    getLocalGuestName() {
        var _a, _b;
        // @ts-ignore
        return ((_b = (_a = index_1.default.Phone.phone) === null || _a === void 0 ? void 0 : _a.client.userAgent) === null || _b === void 0 ? void 0 : _b.options.displayName) || null;
    }
    // Overridden to not listen to websocket messages
    _transferEvents() {
        // Phone events
        index_1.default.Phone.on(this.ON_MESSAGE, this._boundOnMessage);
        index_1.default.Phone.on(this.ON_CHAT, this._boundOnChat);
        index_1.default.Phone.on(this.ON_SIGNAL, this._boundOnSignal);
        index_1.default.Phone.on(this.ON_VIDEO_INPUT_CHANGE, this._boundSaveLocalVideoStream);
        [this.ON_AUDIO_STREAM, this.ON_VIDEO_STREAM, this.ON_REMOVE_STREAM].forEach(event => index_1.default.Phone.on(event, (...args) => this.eventEmitter.emit.apply(this.eventEmitter, [event, ...args])));
    }
    _onMessage(message) {
        // eslint-disable-next-line no-underscore-dangle
        const body = super._onMessage(message);
        if (!body) {
            return;
        }
        const getChannel = () => body.channels[0];
        switch (body.type) {
            case 'ConfbridgeWelcome':
                body.channels.forEach((channel) => {
                    this._onParticipantJoined(channel);
                });
                break;
            case 'ConfbridgeJoin':
                {
                    const channel = getChannel();
                    this._onParticipantJoined(channel);
                    break;
                }
            case 'ConfbridgeLeave':
                {
                    const channel = getChannel();
                    this._onParticipantLeft({
                        data: {
                            call_id: channel.id,
                        },
                    });
                    break;
                }
            default:
                break;
        }
    }
    _onParticipantJoined(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const isLocal = channel.channelvars.WAZO_SIP_CALL_ID === this._getCurrentSipCallIs();
            const callId = channel.id;
            const ParticipantClass = isLocal ? index_1.default.LocalParticipant : index_1.default.RemoteParticipant;
            const name = channel.caller ? channel.caller.name : null;
            const extra = isLocal ? {
                guestName: this.getLocalGuestName(),
            } : {};
            const participant = new ParticipantClass(this, {
                caller_id_name: name,
                call_id: callId,
            }, extra);
            const participantIdx = this.participants.findIndex(other => other.callId === participant.callId);
            if (participantIdx !== -1 && name) {
                this.participants[participantIdx].name = name;
                return;
            }
            if (isLocal) {
                // Should be updated by the Wazo WS but we don't have it for now
                if (this.callSession) {
                    this.callSession.ringing = false;
                }
                this._onLocalParticipantJoined(participant);
                // Give some time for the stream to be updated
                setTimeout(() => {
                    this.eventEmitter.emit(this.ON_JOINED, participant, this.participants);
                }, 1000);
            }
            this.participants.push(participant);
            this._isParticipantJoining(participant);
            return participant;
        });
    }
    _getCurrentSipCallIs() {
        var _a;
        return index_1.default.Phone.getSipSessionId((_a = index_1.default.Phone.phone) === null || _a === void 0 ? void 0 : _a.currentSipSession);
    }
}
exports.default = SipRoom;
