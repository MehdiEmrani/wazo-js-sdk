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
const getApiClient_1 = __importDefault(require("../service/getApiClient"));
class AdHocAPIConference {
    constructor({ phone, host, participants, started, finished, answerTime, conferenceId, muted, paused, }) {
        this.phone = phone;
        this.host = host;
        this.participants = participants || {};
        this.started = started || false;
        this.finished = finished || false;
        this.answerTime = answerTime;
        this.conferenceId = conferenceId || '';
        this.muted = muted || false;
        this.paused = paused || false;
        if (this.host) {
            this.host.setIsConference(true);
        }
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.started = true;
            // @ts-ignore
            this.answerTime = Object.values(this.participants).length ? Object.values(this.participants)[0].answerTime : null;
            const participantIds = Object.keys(this.participants);
            const conference = yield (0, getApiClient_1.default)().calld.createAdHocConference(this.host.callId, participantIds);
            this.conferenceId = conference.conference_id;
            return this;
        });
    }
    getParticipants() {
        return Object.values(this.participants);
    }
    addParticipant(newParticipant) {
        return __awaiter(this, void 0, void 0, function* () {
            const participantCallId = newParticipant.getTalkingToIds()[0];
            const participants = Object.assign(Object.assign({}, this.participants), { [participantCallId]: newParticipant });
            yield (0, getApiClient_1.default)().calld.addAdHocConferenceParticipant(this.conferenceId, participantCallId);
            return new AdHocAPIConference(Object.assign(Object.assign({}, this), { participants }));
        });
    }
    participantHasLeft(leaver) {
        delete this.participants[leaver.getId()];
        return new AdHocAPIConference(Object.assign(Object.assign({}, this), { participants: this.participants }));
    }
    hasParticipants() {
        return Object.keys(this.participants).length > 0;
    }
    mute() {
        this.muted = true;
        this.phone.mute(this.host);
        return new AdHocAPIConference(Object.assign({}, this));
    }
    unmute() {
        this.muted = false;
        this.phone.unmute(this.host);
        return new AdHocAPIConference(Object.assign({}, this));
    }
    hold() {
        this.paused = true;
        this.phone.hold(this.host);
        return new AdHocAPIConference(Object.assign({}, this));
    }
    resume() {
        this.paused = false;
        this.phone.resume(this.host);
        return new AdHocAPIConference(Object.assign({}, this));
    }
    isOnHold() {
        return this.paused;
    }
    isMuted() {
        return this.muted;
    }
    hangup() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, getApiClient_1.default)().calld.deleteAdHocConference(this.conferenceId);
            return new AdHocAPIConference(Object.assign(Object.assign({}, this), { finished: true, participant: [] }));
        });
    }
    removeParticipant(participantToRemove) {
        return __awaiter(this, void 0, void 0, function* () {
            const callId = participantToRemove.getTalkingToIds()[0];
            delete this.participants[callId];
            yield (0, getApiClient_1.default)().calld.removeAdHocConferenceParticipant(this.conferenceId, callId);
            return new AdHocAPIConference(Object.assign(Object.assign({}, this), { participants: this.participants }));
        });
    }
}
exports.default = AdHocAPIConference;
