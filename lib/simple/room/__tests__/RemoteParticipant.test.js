"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Using directly Wazo to avoid issues with require cycle
const index_1 = __importDefault(require("../../index"));
describe('RemoteParticipant', () => {
    it('should fall back on number when name is <unknown>', () => {
        const number = '1234';
        // @ts-expect-error
        const participant = new index_1.default.RemoteParticipant(null, {
            caller_id_name: '<unknown>',
            caller_id_number: number,
        });
        expect(participant.name).toEqual(number);
    });
});
