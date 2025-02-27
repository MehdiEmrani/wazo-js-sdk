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
const Emitter_1 = __importDefault(require("../../utils/Emitter"));
const IssueReporter_1 = __importDefault(require("../../service/IssueReporter"));
const Phone_1 = __importDefault(require("../Phone"));
const Room_1 = require("./Room");
const Contact_1 = __importDefault(require("../../domain/Contact"));
const getApiClient_1 = __importDefault(require("../../service/getApiClient"));
const logger = IssueReporter_1.default.loggerFor('room');
class Participant extends Emitter_1.default {
    /**
     * @param room Room The room where the participant is
     * @param rawParticipant string Participant sent via the Wazo WS
     * @param extra Object extra status of the participant
     */
    constructor(room, rawParticipant, extra = {}) {
        super();
        this.room = room;
        this.uuid = rawParticipant.user_uuid;
        this.name = (rawParticipant.caller_id_name || '').replace("\\'", "'");
        this.number = rawParticipant.caller_id_number;
        this.callId = rawParticipant.call_id;
        this.isTalking = false;
        this.streams = [];
        this.videoStreams = [];
        this.audioMuted = false;
        this.videoMuted = false;
        this.screensharing = false;
        this.isOnHold = false;
        this.extra = extra;
        this.banned = false;
        this.ON_UPDATED = 'participant/ON_UPDATED';
        this.ON_START_TALKING = 'participant/ON_START_TALKING';
        this.ON_STOP_TALKING = 'participant/ON_STOP_TALKING';
        this.ON_DISCONNECT = 'participant/ON_DISCONNECT';
        this.ON_STREAM_SUBSCRIBED = 'participant/ON_STREAM_SUBSCRIBED';
        this.ON_STREAM_UNSUBSCRIBED = 'participant/ON_STREAM_UNSUBSCRIBED';
        this.ON_AUDIO_MUTED = 'participant/ON_AUDIO_MUTED';
        this.ON_AUDIO_UNMUTED = 'participant/ON_AUDIO_UNMUTED';
        this.ON_VIDEO_MUTED = 'participant/ON_VIDEO_MUTED';
        this.ON_VIDEO_UNMUTED = 'participant/ON_VIDEO_UNMUTED';
        this.ON_SCREENSHARING = 'participant/ON_SCREENSHARING';
        this.ON_STOP_SCREENSHARING = 'participant/ON_STOP_SCREENSHARING';
        this.ON_EXTRA_CHANGE = 'participant/ON_EXTRA_CHANGE';
        this.ON_HOLD = 'participant/ON_HOLD';
        this.ON_RESUME = 'participant/ON_RESUME';
        this.ON_BAN = 'participant/ON_BAN';
    }
    triggerEvent(name, ...args) {
        this.eventEmitter.emit.apply(this.eventEmitter, [name, ...args]);
        this.eventEmitter.emit.apply(this.eventEmitter, [this.ON_UPDATED, ...args]);
    }
    triggerUpdate(eventType, broadcast = true) {
        const status = {
            callId: this.callId,
        };
        switch (eventType) {
            case this.ON_START_TALKING:
            case this.ON_STOP_TALKING:
                {
                    status.isTalking = this.isTalking;
                    break;
                }
            case this.ON_AUDIO_MUTED:
            case this.ON_AUDIO_UNMUTED:
                {
                    status.audioMuted = this.audioMuted;
                    break;
                }
            case this.ON_VIDEO_MUTED:
            case this.ON_VIDEO_UNMUTED:
                {
                    status.videoMuted = this.videoMuted;
                    break;
                }
            case this.ON_SCREENSHARING:
            case this.ON_STOP_SCREENSHARING:
                {
                    status.screensharing = this.screensharing;
                    break;
                }
            case this.ON_HOLD:
            case this.ON_RESUME:
                {
                    status.isOnHold = this.isOnHold;
                    break;
                }
            case this.ON_EXTRA_CHANGE:
                {
                    status.extra = this.extra;
                    break;
                }
            case this.ON_BAN:
                {
                    status.banned = true;
                    break;
                }
            default:
                break;
        }
        if (broadcast) {
            this.broadcastStatus(status);
        }
        this.eventEmitter.emit(eventType, status);
        this.eventEmitter.emit(this.ON_UPDATED, eventType, status);
    }
    onTalking(isTalking) {
        logger.info('on participant talking', {
            name: this.name,
            isTalking,
            callId: this.callId,
        });
        this.isTalking = isTalking;
        // you may notice we're not broadcasting: since all participants are getting this info
        // directly from asterisk, there's no need to do so
        this.triggerUpdate(this.isTalking ? this.ON_START_TALKING : this.ON_STOP_TALKING, false);
    }
    onDisconnect() {
        return this.triggerEvent(this.ON_DISCONNECT);
    }
    onStreamSubscribed(stream) {
        return this.triggerEvent(this.ON_STREAM_SUBSCRIBED, stream);
    }
    onStreamUnSubscribed(stream) {
        return this.triggerEvent(this.ON_STREAM_UNSUBSCRIBED, stream);
    }
    onAudioMuted(broadcast = true) {
        if (this.audioMuted) {
            return;
        }
        this.audioMuted = true;
        this.triggerUpdate(this.ON_AUDIO_MUTED, broadcast);
    }
    onAudioUnMuted(broadcast = true) {
        if (!this.audioMuted) {
            return;
        }
        this.audioMuted = false;
        this.triggerUpdate(this.ON_AUDIO_UNMUTED, broadcast);
    }
    onVideoMuted(broadcast = true) {
        if (this.videoMuted) {
            return;
        }
        this.videoMuted = true;
        this.triggerUpdate(this.ON_VIDEO_MUTED, broadcast);
    }
    onVideoUnMuted(broadcast = true) {
        if (!this.videoMuted) {
            return;
        }
        this.videoMuted = false;
        this.triggerUpdate(this.ON_VIDEO_UNMUTED, broadcast);
    }
    onScreensharing(broadcast = true) {
        if (this.screensharing) {
            return;
        }
        this.screensharing = true;
        this.triggerUpdate(this.ON_SCREENSHARING, broadcast);
    }
    onStopScreensharing(broadcast = true) {
        if (!this.screensharing) {
            return;
        }
        this.screensharing = false;
        this.triggerUpdate(this.ON_STOP_SCREENSHARING, broadcast);
    }
    onHold(broadcast = true) {
        if (this.isOnHold) {
            return;
        }
        this.isOnHold = true;
        this.triggerUpdate(this.ON_HOLD, broadcast);
    }
    onResume(broadcast = true) {
        if (!this.isOnHold) {
            return;
        }
        this.isOnHold = false;
        this.triggerUpdate(this.ON_RESUME, broadcast);
    }
    onBan(broadcast = true) {
        this.banned = true;
        this.triggerUpdate(this.ON_BAN, broadcast);
    }
    getStatus() {
        return {
            callId: this.callId,
            audioMuted: this.audioMuted,
            videoMuted: this.videoMuted,
            screensharing: this.screensharing,
            isTalking: this.isTalking,
            extra: this.extra,
        };
    }
    updateStatus(status, broadcast = true) {
        logger.info('updating participant status', {
            name: this.name,
            status,
        });
        if (typeof status.audioMuted !== 'undefined' && status.audioMuted !== this.audioMuted) {
            if (status.audioMuted) {
                this.onAudioMuted(broadcast);
            }
            else {
                this.onAudioUnMuted(broadcast);
            }
        }
        if (typeof status.videoMuted !== 'undefined' && status.videoMuted !== this.videoMuted) {
            if (status.videoMuted) {
                this.onVideoMuted(broadcast);
            }
            else {
                this.onVideoUnMuted(broadcast);
            }
        }
        if (typeof status.screensharing !== 'undefined' && status.screensharing !== this.screensharing) {
            if (status.screensharing) {
                this.onScreensharing(broadcast);
            }
            else {
                this.onStopScreensharing(broadcast);
            }
        }
        if (typeof status.isOnHold !== 'undefined' && status.isOnHold !== this.isOnHold) {
            if (status.isOnHold) {
                this.onHold(broadcast);
            }
            else {
                this.onResume(broadcast);
            }
        }
        if (status.banned) {
            this.onBan(false);
        }
        // Poor man's object comparison
        if (typeof status.extra !== 'undefined' && JSON.stringify(this.extra) !== JSON.stringify(status.extra)) {
            this.extra = Object.assign(Object.assign({}, this.extra), status.extra);
            if (this.extra.contact && !(this.extra.contact instanceof Contact_1.default)) {
                this.extra.contact = new Contact_1.default(this.extra.contact);
            }
            this.triggerUpdate(this.ON_EXTRA_CHANGE, broadcast);
        }
    }
    broadcastStatus(inboundStatus = null, sendReinvite = null) {
        var _a, _b;
        const status = inboundStatus || this.getStatus();
        logger.info('broadcasting participant status', {
            callId: this.callId,
            status,
        });
        if (sendReinvite && !this.streams.length && Phone_1.default.phone) {
            // eslint-disable-next-line no-underscore-dangle
            Phone_1.default.phone._sendReinviteMessage((_a = this.room) === null || _a === void 0 ? void 0 : _a.callSession, false);
        }
        (_b = this.room) === null || _b === void 0 ? void 0 : _b.sendSignal({
            type: Room_1.SIGNAL_TYPE_PARTICIPANT_UPDATE,
            origin: this.callId,
            status,
        });
    }
    resetStreams(streams) {
        this.streams = streams;
        this.videoStreams = streams;
    }
    ban(apiRequestDelay = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const { meetingUuid, } = this.room || {};
            if (!meetingUuid) {
                throw new Error('Attempting to ban a participant without a `meetingUuid`');
            }
            // this notifies all that someone is being banned
            this.onBan(true);
            // this allows to delay the actual ban, in order for the banned participant as well as others to react to the situation
            if (apiRequestDelay) {
                yield this.delay(apiRequestDelay);
            }
            // proceed with the actual kick
            return (0, getApiClient_1.default)().calld.banMeetingParticipant(meetingUuid, this.callId);
        });
    }
    delay(ms) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => setTimeout(resolve, ms));
        });
    }
}
exports.default = Participant;
