"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const new_from_1 = __importDefault(require("../utils/new-from"));
const update_from_1 = __importDefault(require("../utils/update-from"));
class Room {
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
        return new Room(Object.assign(Object.assign({}, this), { connectedCallSession: callSession }));
    }
    has(callSession) {
        return !!this.connectedCallSession && this.connectedCallSession.is(callSession);
    }
    addParticipant(uuid, extension, talking = null) {
        if (!this.participants.some(participant => participant.uuid === uuid || participant.extension === extension)) {
            return new Room(Object.assign(Object.assign({}, this), { participants: [...this.participants, {
                        uuid,
                        extension,
                        talking,
                    }] }));
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
            updatedParticipants[idx] = Object.assign(Object.assign({}, updatedParticipants[idx]), participant);
        }
        else {
            updatedParticipants.push(participant);
        }
        return new Room(Object.assign(Object.assign({}, this), { participants: updatedParticipants }));
    }
    updateParticipantByExtension(extension, participant, shouldAdd = false) {
        const idx = this.participants.findIndex(someParticipant => someParticipant.extension === extension);
        if (idx === -1 && !shouldAdd) {
            return this;
        }
        const updatedParticipants = [...this.participants];
        if (idx !== -1) {
            updatedParticipants[idx] = Object.assign(Object.assign({}, updatedParticipants[idx]), participant);
        }
        else {
            updatedParticipants.push(participant);
        }
        return new Room(Object.assign(Object.assign({}, this), { participants: updatedParticipants }));
    }
    hasCallWithId(id) {
        return !!this.connectedCallSession && this.connectedCallSession.getId() === id;
    }
    disconnect() {
        return new Room(Object.assign(Object.assign({}, this), { connectedCallSession: null }));
    }
    removeParticipantWithUUID(uuid) {
        return new Room(Object.assign(Object.assign({}, this), { participants: this.participants.filter(participant => participant.uuid !== uuid) }));
    }
    removeParticipantWithExtension(extension) {
        return new Room(Object.assign(Object.assign({}, this), { participants: this.participants.filter(participant => participant.extension !== extension) }));
    }
    updateFrom(room) {
        (0, update_from_1.default)(this, room);
    }
    static newFrom(room) {
        return (0, new_from_1.default)(room, Room);
    }
}
exports.default = Room;
