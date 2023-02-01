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
const CallSession_1 = __importDefault(require("../CallSession"));
const Room_1 = __importDefault(require("../Room"));
describe('Room', () => {
    describe('on get extension', () => {
        describe('given a connected call', () => {
            it('should return the number of the cal', () => __awaiter(void 0, void 0, void 0, function* () {
                const number = 'some-number';
                const room = new Room_1.default({
                    id: 'some-id',
                    // @ts-expect-error
                    connectedCallSession: new CallSession_1.default({
                        number,
                    }),
                    participants: [],
                });
                const extension = room.getExtension();
                expect(extension).toEqual(number);
            }));
        });
        describe('given NO connected call', () => {
            it('should return nothing', () => __awaiter(void 0, void 0, void 0, function* () {
                const room = new Room_1.default({
                    id: 'some-id',
                    connectedCallSession: null,
                    participants: [],
                });
                const extension = room.getExtension();
                expect(extension).toBeNull();
            }));
        });
    });
    describe('on connect call', () => {
        it('should add call to room', () => __awaiter(void 0, void 0, void 0, function* () {
            // @ts-expect-error
            const room = new Room_1.default({
                id: 'some-id',
            });
            // @ts-expect-error
            const callSession = new CallSession_1.default({
                callId: 'some-call-id',
            });
            const connectedRoom = room.connect(callSession);
            expect(connectedRoom.connectedCallSession).toBe(callSession);
        }));
    });
    describe('on room has call', () => {
        describe('given no connected call', () => {
            it('should be false', () => __awaiter(void 0, void 0, void 0, function* () {
                // @ts-expect-error
                const room = new Room_1.default({
                    connectedCallSession: null,
                });
                // @ts-expect-error
                const callSession = new CallSession_1.default({});
                const roomHasCall = room.has(callSession);
                expect(roomHasCall).toBeFalsy();
            }));
        });
        describe('given a connected call', () => {
            it('should be true if same calls', () => __awaiter(void 0, void 0, void 0, function* () {
                // @ts-expect-error
                const callSession = new CallSession_1.default({
                    callId: 'some-call-id',
                });
                // @ts-expect-error
                const room = new Room_1.default({
                    connectedCallSession: callSession,
                });
                const roomHasCall = room.has(callSession);
                expect(roomHasCall).toBeTruthy();
            }));
            it('should be false if different calls', () => __awaiter(void 0, void 0, void 0, function* () {
                // @ts-expect-error
                const call1 = new CallSession_1.default({
                    callId: 'some-call-id',
                });
                // @ts-expect-error
                const call2 = new CallSession_1.default({
                    callId: 'some-other-call-id',
                });
                // @ts-expect-error
                const room = new Room_1.default({
                    connectedCallSession: call1,
                });
                const roomHasCall = room.has(call2);
                expect(roomHasCall).toBeFalsy();
            }));
        });
    });
    describe('on add participant', () => {
        it('should add participant to room', () => __awaiter(void 0, void 0, void 0, function* () {
            const participants = [{}];
            const room = new Room_1.default({
                connectedCallSession: null,
                // @ts-expect-error
                participants,
            });
            const participantUuid = 'some-uuid';
            const participantExtension = 'some-extension';
            const updatedRoom = room.addParticipant(participantUuid, participantExtension);
            expect(updatedRoom.participants[1].uuid).toEqual(participantUuid);
            expect(updatedRoom.participants[1].extension).toEqual(participantExtension);
        }));
    });
    describe('on room has call with id', () => {
        describe('given no connected call', () => {
            it('should be false', () => __awaiter(void 0, void 0, void 0, function* () {
                // @ts-expect-error
                const room = new Room_1.default({
                    connectedCallSession: null,
                });
                const callId = 'some-call-id';
                const roomHasCall = room.hasCallWithId(callId);
                expect(roomHasCall).toBeFalsy();
            }));
        });
        describe('given a connected call', () => {
            it('should be true if same calls', () => __awaiter(void 0, void 0, void 0, function* () {
                const callId = 'some-call-id';
                // @ts-expect-error
                const room = new Room_1.default({
                    // @ts-expect-error
                    connectedCallSession: new CallSession_1.default({
                        callId,
                    }),
                });
                const roomHasCall = room.hasCallWithId(callId);
                expect(roomHasCall).toBeTruthy();
            }));
            it('should be false if different calls', () => __awaiter(void 0, void 0, void 0, function* () {
                const callId = 'some-call-id';
                // @ts-expect-error
                const room = new Room_1.default({
                    // @ts-expect-error
                    connectedCallSession: new CallSession_1.default({
                        callId: 'some-other-call-id',
                    }),
                });
                const roomHasCall = room.hasCallWithId(callId);
                expect(roomHasCall).toBeFalsy();
            }));
        });
    });
    describe('on updated participant with UUID', () => {
        it('should updated participant with corresponding UUID', () => __awaiter(void 0, void 0, void 0, function* () {
            const uuid = 'some-uuid';
            const room = new Room_1.default({
                // @ts-expect-error
                participants: [{
                        uuid,
                        talking: true,
                    }],
            });
            expect(room.participants[0].talking).toBeTruthy();
            const updatedRoom = room.updateParticipant(uuid, {
                talking: false,
            });
            expect(updatedRoom.participants[0].talking).toBeFalsy();
        }));
        it('should add participant when not found', () => __awaiter(void 0, void 0, void 0, function* () {
            const uuid = 'some-uuid';
            // @ts-expect-error
            const room = new Room_1.default({
                participants: [],
            });
            const updatedRoom = room.updateParticipant(uuid, {
                talking: false,
            }, true);
            expect(updatedRoom.participants[0].talking).toBeFalsy();
        }));
    });
    describe('on updated participant by extension', () => {
        it('should updated participant with corresponding extension', () => __awaiter(void 0, void 0, void 0, function* () {
            const extension = 1234;
            const room = new Room_1.default({
                participants: [{
                        // @ts-expect-error
                        extension,
                        talking: false,
                    }],
            });
            expect(room.participants[0].talking).toBeFalsy();
            // @ts-expect-error
            const updatedRoom = room.updateParticipantByExtension(extension, {
                talking: true,
            });
            expect(updatedRoom.participants[0].talking).toBeTruthy();
        }));
    });
    describe('on disconnect', () => {
        it('should destroy connected call', () => __awaiter(void 0, void 0, void 0, function* () {
            // @ts-expect-error
            const room = new Room_1.default({
                // @ts-expect-error
                connectedCallSession: new CallSession_1.default({}),
            });
            expect(room.connectedCallSession).not.toBeNull();
            const updatedRoom = room.disconnect();
            expect(updatedRoom.connectedCallSession).toBeNull();
        }));
    });
    describe('on remove participant with UUID', () => {
        it('should remove participant with corresponding UUID', () => __awaiter(void 0, void 0, void 0, function* () {
            const uuid = 'some-uuid';
            const room = new Room_1.default({
                // @ts-expect-error
                participants: [{
                        uuid,
                    }],
            });
            expect(room.participants.some(participant => participant.uuid === uuid)).toBeTruthy();
            const updatedRoom = room.removeParticipantWithUUID(uuid);
            expect(updatedRoom.participants.some(participant => participant.uuid === uuid)).toBeFalsy();
        }));
    });
    describe('on remove participant with extension', () => {
        it('should remove participant with corresponding UUID', () => __awaiter(void 0, void 0, void 0, function* () {
            const extension = 'some-extension';
            const room = new Room_1.default({
                // @ts-expect-error
                participants: [{
                        extension,
                    }],
            });
            expect(room.participants.some(participant => participant.extension === extension)).toBeTruthy();
            const updatedRoom = room.removeParticipantWithExtension(extension);
            expect(updatedRoom.participants.some(participant => participant.extension === extension)).toBeFalsy();
        }));
    });
});
