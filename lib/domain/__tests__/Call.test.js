"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const Call_1 = __importDefault(require("../Call"));
describe('Call domain', () => {
    it('can return the elapsed time since its creation in seconds', () => {
        Date.now = jest.fn(() => new Date(2012, 7, 28, 13, 0, 0));
        const call = new Call_1.default({
            startingTime: new Date(2012, 7, 28, 12, 30, 0),
        });
        const elapsedTimeInSeconds = call.getElapsedTimeInSeconds();
        expect(elapsedTimeInSeconds).toBe(30 * 60);
    });
    it('has the number provided it is the same number', () => {
        const call = new Call_1.default({
            calleeName: 'John Doe',
            calleeNumber: '911',
        });
        expect(call.hasNumber('911')).toBeTruthy();
    });
    it('does not have the number provided it is a different number', () => {
        const call = new Call_1.default({
            calleeName: 'John Doe',
            calleeNumber: '911',
        });
        expect(call.hasNumber('418-222-5555')).toBeFalsy();
    });
});
