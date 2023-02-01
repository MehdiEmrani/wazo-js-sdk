"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const SipLine_1 = __importDefault(require("../SipLine"));
describe('SipLine domain', () => {
    describe('Endpoint (20.13 and higher)', () => {
        it('can tell if we have videoConference capabilities', () => {
            const getSipLine = endpointSectionOptions => new SipLine_1.default({
                endpointSectionOptions,
            });
            expect(getSipLine([['max_audio_streams', '1'], ['max_video_streams', '2']]).hasVideoConference()).toBe(true);
            expect(getSipLine([['max_audio_streams', '1'], ['max_video_streams', '1']]).hasVideoConference()).toBe(false);
            expect(getSipLine([['max_audio_streams', '2']]).hasVideoConference()).toBe(false);
            expect(getSipLine([['max_video_streams', '2']]).hasVideoConference()).toBe(false);
            expect(getSipLine([['max_audio_streams', '2'], ['max_video_streams', '2']]).hasVideoConference()).toBe(true);
        });
    });
    describe('Old Endpoint', () => {
        it('can tell if we have videoConference capabilities', () => {
            const getSipLine = options => new SipLine_1.default({
                options,
            });
            expect(getSipLine([['max_audio_streams', '1'], ['max_video_streams', '2']]).hasVideoConference()).toBe(true);
            expect(getSipLine([['max_audio_streams', '1'], ['max_video_streams', '1']]).hasVideoConference()).toBe(false);
            expect(getSipLine([['max_audio_streams', '2']]).hasVideoConference()).toBe(false);
            expect(getSipLine([['max_video_streams', '2']]).hasVideoConference()).toBe(false);
            expect(getSipLine([['max_audio_streams', '2'], ['max_video_streams', '2']]).hasVideoConference()).toBe(true);
        });
    });
});
