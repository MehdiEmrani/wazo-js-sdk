import newFrom from '../utils/new-from';
import updateFrom from '../utils/update-from';
export default class Room {
    id;
    name;
    connectedCallSession;
    participants;
    constructor({ id, connectedCallSession, participants, name, }) {
        this.id = id;
        this.connectedCallSession = connectedCallSession;
        this.participants = participants;
        this.name = name;
    }
    getExtension() {
        return this.connectedCallSession ? this.connectedCallSession.number : null;
    }
    connect(callSession) {
        return new Room({ ...this,
            connectedCallSession: callSession,
        });
    }
    has(callSession) {
        return !!this.connectedCallSession && this.connectedCallSession.is(callSession);
    }
    addParticipant(uuid, extension, talking = null) {
        if (!this.participants.some(participant => participant.uuid === uuid || participant.extension === extension)) {
            return new Room({ ...this,
                participants: [...this.participants, {
                        uuid,
                        extension,
                        talking,
                    }],
            });
        }
        return this;
    }
    updateParticipant(uuid, participant, shouldAdd = false) {
        const idx = this.participants.findIndex(someParticipant => someParticipant.uuid === uuid);
        if (idx === -1 && !shouldAdd) {
            return this;
        }
        const updatedParticipants = [...this.participants];
        if (idx !== -1) {
            updatedParticipants[idx] = { ...updatedParticipants[idx],
                ...participant,
            };
        }
        else {
            updatedParticipants.push(participant);
        }
        return new Room({ ...this,
            participants: updatedParticipants,
        });
    }
    updateParticipantByExtension(extension, participant, shouldAdd = false) {
        const idx = this.participants.findIndex(someParticipant => someParticipant.extension === extension);
        if (idx === -1 && !shouldAdd) {
            return this;
        }
        const updatedParticipants = [...this.participants];
        if (idx !== -1) {
            updatedParticipants[idx] = { ...updatedParticipants[idx],
                ...participant,
            };
        }
        else {
            updatedParticipants.push(participant);
        }
        return new Room({ ...this,
            participants: updatedParticipants,
        });
    }
    hasCallWithId(id) {
        return !!this.connectedCallSession && this.connectedCallSession.getId() === id;
    }
    disconnect() {
        return new Room({ ...this,
            connectedCallSession: null,
        });
    }
    removeParticipantWithUUID(uuid) {
        return new Room({ ...this,
            participants: this.participants.filter(participant => participant.uuid !== uuid),
        });
    }
    removeParticipantWithExtension(extension) {
        return new Room({ ...this,
            participants: this.participants.filter(participant => participant.extension !== extension),
        });
    }
    updateFrom(room) {
        updateFrom(this, room);
    }
    static newFrom(room) {
        return newFrom(room, Room);
    }
}
