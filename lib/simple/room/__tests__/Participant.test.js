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
// Using directly Wazo to avoid issues with require cycle
const getApiClient_1 = __importDefault(require("../../../service/getApiClient"));
const index_1 = __importDefault(require("../../index"));
const Room_1 = __importDefault(require("../Room"));
jest.mock('../../../service/getApiClient');
describe('Participant', () => {
    describe('ban', () => {
        it('should throw an error when there is no meeting', () => __awaiter(void 0, void 0, void 0, function* () {
            // @ts-expect-error
            const room = new Room_1.default();
            const participant = new index_1.default.RemoteParticipant(room, {
                call_id: 'id',
                caller_id_name: 'Alice',
                caller_id_number: 'number',
                user_uuid: 'some_uuid',
            });
            yield expect(() => __awaiter(void 0, void 0, void 0, function* () { return participant.ban(); })).rejects.toThrow('Attempting to ban a participant without a `meetingUuid`');
        }));
        it('should call the api', () => __awaiter(void 0, void 0, void 0, function* () {
            const number = '1234';
            const meetingUuid = 'some-meeting-uuid';
            const callId = 'some-call-id';
            // @ts-expect-error
            const room = new Room_1.default();
            room.setMeetingUuid(meetingUuid);
            const banMeetingParticipant = jest.fn();
            // @ts-expect-error
            getApiClient_1.default.mockImplementation(() => ({
                calld: {
                    banMeetingParticipant,
                },
            }));
            const participant = new index_1.default.RemoteParticipant(room, {
                call_id: callId,
                caller_id_name: 'Alice',
                caller_id_number: number,
                user_uuid: 'some_uuid',
            });
            participant.onBan = jest.fn();
            yield participant.ban();
            expect(banMeetingParticipant).toHaveBeenCalledWith(meetingUuid, callId);
            expect(participant.onBan).toHaveBeenCalledWith(true);
        }));
        it('should call the api with a delay', () => __awaiter(void 0, void 0, void 0, function* () {
            const number = '1234';
            const meetingUuid = 'some-meeting-uuid';
            const callId = 'some-call-id';
            const someDelay = 2;
            // @ts-expect-error
            const room = new Room_1.default();
            room.setMeetingUuid(meetingUuid);
            const banMeetingParticipant = jest.fn();
            // @ts-expect-error
            getApiClient_1.default.mockImplementation(() => ({
                calld: {
                    banMeetingParticipant,
                },
            }));
            const participant = new index_1.default.RemoteParticipant(room, {
                call_id: callId,
                caller_id_name: 'Alice',
                caller_id_number: number,
                user_uuid: 'some_uuid',
            });
            participant.delay = jest.fn();
            participant.onBan = jest.fn();
            yield participant.ban(someDelay);
            expect(banMeetingParticipant).toHaveBeenCalledWith(meetingUuid, callId);
            expect(participant.delay).toHaveBeenCalledWith(someDelay);
            expect(participant.onBan).toHaveBeenCalledWith(true);
        }));
    });
});
