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
const web_rtc_client_1 = __importDefault(require("../web-rtc-client"));
jest.mock('sip.js/lib/platform/web/transport');
// @ts-expect-error
const client = new web_rtc_client_1.default({});
describe('WebRTC client', () => {
    it('should compute muted/unmuted state', () => __awaiter(void 0, void 0, void 0, function* () {
        const mutedSession = {
            sessionDescriptionHandler: {
                peerConnection: {
                    getSenders: () => [{
                            track: {
                                kind: 'audio',
                                enabled: false,
                            },
                        }],
                },
            },
        };
        const unMutedSession = {
            sessionDescriptionHandler: {
                peerConnection: {
                    getSenders: () => [{
                            track: {
                                kind: 'audio',
                                enabled: true,
                            },
                        }],
                },
            },
        };
        const oldKindMuted = {
            sessionDescriptionHandler: {
                peerConnection: {
                    getLocalStreams: () => [{
                            getAudioTracks: () => [{
                                    enabled: false,
                                }],
                        }],
                },
            },
        };
        const oldKindUnmuted = {
            sessionDescriptionHandler: {
                peerConnection: {
                    getLocalStreams: () => [{
                            getAudioTracks: () => [{
                                    enabled: true,
                                }],
                        }],
                },
            },
        };
        // @ts-expect-error
        expect(client.isAudioMuted(mutedSession)).toBeTruthy();
        // @ts-expect-error
        expect(client.isAudioMuted(oldKindMuted)).toBeTruthy();
        // @ts-expect-error
        expect(client.isAudioMuted(unMutedSession)).toBeFalsy();
        // @ts-expect-error
        expect(client.isAudioMuted(oldKindUnmuted)).toBeFalsy();
    }));
});
describe('changeAudioInputDevice', () => {
    const defaultId = 'default';
    const deviceId = 'device1';
    const constraints = {
        audio: {
            deviceId: {
                exact: defaultId,
            },
        },
        video: null,
    };
    const session = {
        sessionDescriptionHandler: {
            peerConnection: {
                getSenders: () => [{
                        track: {
                            kind: 'audio',
                            enabled: true,
                        },
                    }],
            },
        },
    };
    const stream = {};
    const getAudioTracksMock = jest.fn(() => []);
    Object.defineProperty(stream, 'getAudioTracks', {
        value: getAudioTracksMock,
    });
    const getUserMediaMock = jest.fn(() => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise(resolve => {
            resolve(stream);
        });
    }));
    const devices = [{
            deviceId: 'default',
            kind: 'audioinput',
            label: 'Default - Fake Microphone',
            groupId: 'fak3Gr0up3',
        }, {
            deviceId: 'fak3d3v1c3',
            kind: 'audioinput',
            label: 'Fake Microphone',
            groupId: 'fak3Gr0up3',
        }];
    const enumerateDevicesMock = jest.fn(() => __awaiter(void 0, void 0, void 0, function* () {
        return new Promise(resolve => {
            resolve(devices);
        });
    }));
    Object.defineProperty(global.navigator, 'mediaDevices', {
        value: {
            getUserMedia: getUserMediaMock,
            enumerateDevices: enumerateDevicesMock,
        },
    });
    it('should change the audio input track if the provided id is different', () => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-expect-error
        client.setMediaConstraints(constraints);
        expect(client.getAudioDeviceId()).toBe(defaultId);
        // @ts-expect-error
        const result = yield client.changeAudioInputDevice(deviceId, session);
        expect(result).toBeTruthy();
    }));
    it('should NOT change the audio input track if the provided id is the same', () => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-expect-error
        client.setMediaConstraints(constraints);
        expect(client.getAudioDeviceId()).toBe(defaultId);
        // @ts-expect-error
        const result = yield client.changeAudioInputDevice(defaultId, session);
        expect(result).toBeFalsy();
    }));
    it('should change the audio input track if the provided id is the same and force param is TRUE', () => __awaiter(void 0, void 0, void 0, function* () {
        // @ts-expect-error
        client.setMediaConstraints(constraints);
        expect(client.getAudioDeviceId()).toBe(defaultId);
        // @ts-expect-error
        const result = yield client.changeAudioInputDevice(defaultId, session, true);
        expect(result).toBeTruthy();
    }));
    describe('setVideoInputDevice', () => {
        it('should retain its original video values', () => {
            const video = {
                height: {
                    min: 480,
                    max: 720,
                },
                width: {
                    min: 640,
                    max: 1280,
                },
            };
            client.video = video;
            client.setVideoInputDevice(deviceId);
            expect(client.video).toEqual(Object.assign(Object.assign({}, video), { deviceId: {
                    exact: deviceId,
                } }));
        });
        it('should set deviceId when video\'s original value is true', () => {
            client.video = true;
            client.setVideoInputDevice(deviceId);
            expect(client.video).toEqual({
                deviceId: {
                    exact: deviceId,
                },
            });
        });
        it('should set deviceId when video\'s original value is not set', () => {
            client.video = undefined;
            client.setVideoInputDevice(deviceId);
            expect(client.video).toEqual({
                deviceId: {
                    exact: deviceId,
                },
            });
        });
        it('should NOT set deviceId when its value does not change', () => {
            client.video = {
                deviceId: {
                    exact: deviceId,
                },
            };
            const result = client.setVideoInputDevice(deviceId);
            expect(result).toEqual(null);
            expect(client.video).toEqual({
                deviceId: {
                    exact: deviceId,
                },
            });
        });
    });
});
