import getApiClient from '../service/getApiClient';
export default class AdHocAPIConference {
    phone;
    host;
    participants;
    started;
    finished;
    conferenceId;
    answerTime;
    muted;
    paused;
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
    async start() {
        this.started = true;
        // @ts-ignore
        this.answerTime = Object.values(this.participants).length ? Object.values(this.participants)[0].answerTime : null;
        const participantIds = Object.keys(this.participants);
        const conference = await getApiClient().calld.createAdHocConference(this.host.callId, participantIds);
        this.conferenceId = conference.conference_id;
        return this;
    }
    getParticipants() {
        return Object.values(this.participants);
    }
    async addParticipant(newParticipant) {
        const participantCallId = newParticipant.getTalkingToIds()[0];
        const participants = { ...this.participants,
            [participantCallId]: newParticipant,
        };
        await getApiClient().calld.addAdHocConferenceParticipant(this.conferenceId, participantCallId);
        return new AdHocAPIConference({ ...this,
            participants,
        });
    }
    participantHasLeft(leaver) {
        delete this.participants[leaver.getId()];
        return new AdHocAPIConference({ ...this,
            participants: this.participants,
        });
    }
    hasParticipants() {
        return Object.keys(this.participants).length > 0;
    }
    mute() {
        this.muted = true;
        this.phone.mute(this.host);
        return new AdHocAPIConference({ ...this,
        });
    }
    unmute() {
        this.muted = false;
        this.phone.unmute(this.host);
        return new AdHocAPIConference({ ...this,
        });
    }
    hold() {
        this.paused = true;
        this.phone.hold(this.host);
        return new AdHocAPIConference({ ...this,
        });
    }
    resume() {
        this.paused = false;
        this.phone.resume(this.host);
        return new AdHocAPIConference({ ...this,
        });
    }
    isOnHold() {
        return this.paused;
    }
    isMuted() {
        return this.muted;
    }
    async hangup() {
        await getApiClient().calld.deleteAdHocConference(this.conferenceId);
        return new AdHocAPIConference({ ...this,
            finished: true,
            participant: [],
        });
    }
    async removeParticipant(participantToRemove) {
        const callId = participantToRemove.getTalkingToIds()[0];
        delete this.participants[callId];
        await getApiClient().calld.removeAdHocConferenceParticipant(this.conferenceId, callId);
        return new AdHocAPIConference({ ...this,
            participants: this.participants,
        });
    }
}
