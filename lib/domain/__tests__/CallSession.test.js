"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const CallSession_1 = __importDefault(require("../CallSession"));
const stringify = cs => JSON.parse(JSON.stringify(cs));
describe('CallSession domain', () => {
    it('should update from another CallSession without data loss', () => {
        const callSession = new CallSession_1.default({
            callId: null,
            sipCallId: 123,
            paused: false,
            number: '8001',
            isCaller: true,
            dialedExtension: null,
        });
        const anotherCallSession = new CallSession_1.default({
            callId: 345,
            callerNumber: '8008',
            number: '8008',
            isCaller: false,
            dialedExtension: undefined,
        });
        callSession.updateFrom(anotherCallSession);
        expect(callSession.callId).toBe(345);
        expect(callSession.sipCallId).toBe(123);
        expect(callSession.paused).toBe(false);
        expect(callSession.ringing).toBe(undefined);
        expect(callSession.callerNumber).toBe('8008');
        expect(callSession.number).toBe('8008');
        expect(callSession.isCaller).toBe(false);
        expect(callSession.dialedExtension).toBe('');
    });
    it('should compare 2 callSession', () => {
        const cs1 = new CallSession_1.default({
            callId: 123,
            sipCallId: 456,
        });
        const cs2 = new CallSession_1.default({
            callId: 123,
            sipCallId: null,
        });
        expect(cs1.is(cs2)).toBeTruthy();
        expect(cs2.is(cs1)).toBeTruthy();
    });
    it('should set answerTime when setting answered to true', () => {
        const cs1 = new CallSession_1.default({});
        cs1.answered = true;
        const cs2 = new CallSession_1.default({});
        cs2.answer();
        const cs3 = new CallSession_1.default({
            answered: true,
        });
        expect(cs1.answered).toEqual(true);
        expect(cs1.answerTime).not.toBeNull();
        expect(cs2.answered).toEqual(true);
        expect(cs2.answerTime).not.toBeNull();
        expect(cs3.answered).toEqual(true);
        expect(cs3.answerTime).not.toBeNull();
        const cs4 = stringify(cs1);
        const cs5 = stringify(cs2);
        const cs6 = stringify(cs3);
        expect(cs4.answered).toEqual(true);
        expect(cs5.answered).toEqual(true);
        expect(cs6.answered).toEqual(true);
    });
    it('should reset answerTime when setting answered to false', () => {
        const cs1 = new CallSession_1.default({});
        cs1.answered = false;
        const cs2 = new CallSession_1.default({
            answered: false,
        });
        expect(cs1.answered).toEqual(false);
        expect(cs1.answerTime).toBeNull();
        expect(cs2.answered).toEqual(false);
        expect(cs2.answerTime).toBeNull();
        const cs4 = stringify(cs1);
        const cs5 = stringify(cs2);
        expect(cs4.answered).toEqual(false);
        expect(cs5.answered).toEqual(false);
    });
});
