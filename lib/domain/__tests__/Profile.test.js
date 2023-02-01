"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const Profile_1 = __importDefault(require("../Profile"));
const Line_1 = __importDefault(require("../Line"));
const ForwardOption_1 = __importStar(require("../ForwardOption"));
describe('Profile domain', () => {
    it('should create a new Profile from another one', () => {
        const attributes = {
            id: '123',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@acme.com',
            lines: [new Line_1.default({
                    id: 9012,
                    extensions: [{
                            id: 1,
                            exten: '8000',
                            context: 'default',
                        }],
                    endpoint_custom: null,
                })],
            username: 'john.doe',
            forwards: [],
            mobileNumber: '123',
        };
        const oldProfile = new Profile_1.default(attributes);
        const newProfile = Profile_1.default.newFrom(oldProfile);
        expect(newProfile).toBeInstanceOf(Profile_1.default);
        expect(newProfile.firstName).toBe(attributes.firstName);
        expect(newProfile.email).toBe(attributes.email);
        expect(newProfile.lines[0].extensions[0].exten).toBe('8000');
    });
    it('can parse a plain profile to domain', () => {
        const plain = {
            id: 10,
            uuid: 'xxx-xxx-xxx-xx',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@acme.com',
            subscription_type: 2,
            lines: [{
                    id: 9012,
                    extensions: [{
                            id: 1,
                            exten: '8000',
                            context: 'default',
                        }],
                    endpoint_custom: null,
                }, {
                    id: 3421,
                    extensions: [{
                            id: 2,
                            exten: '9980',
                            context: 'internal',
                        }],
                    endpoint_custom: null,
                }],
            username: 'john.doe',
            services: {
                dnd: {
                    enabled: false,
                },
            },
            forwards: {
                busy: {
                    destination: '1',
                    enabled: true,
                },
                noanswer: {
                    destination: '',
                    enabled: false,
                },
                unconditional: {
                    destination: '12',
                    enabled: true,
                },
            },
            groups: [],
            language: 'FR',
            mobile_phone_number: null,
            timezone: null,
            mobileNumber: '1234',
            switchboards: [],
            call_pickup_target_users: [{
                    uuid: 'uuid-0',
                    firstname: 'FirstName-0',
                    lastname: 'LastName-0',
                }],
            online_call_record_enabled: true,
        };
        const profile = Profile_1.default.parse(plain);
        expect(profile).toEqual(new Profile_1.default({
            id: 'xxx-xxx-xxx-xx',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@acme.com',
            forwards: [new ForwardOption_1.default({
                    destination: '12',
                    enabled: true,
                    key: ForwardOption_1.FORWARD_KEYS.UNCONDITIONAL,
                }), new ForwardOption_1.default({
                    destination: '',
                    enabled: false,
                    key: ForwardOption_1.FORWARD_KEYS.NO_ANSWER,
                }), new ForwardOption_1.default({
                    destination: '1',
                    enabled: true,
                    key: ForwardOption_1.FORWARD_KEYS.BUSY,
                })],
            lines: [new Line_1.default({
                    id: 9012,
                    extensions: [{
                            id: 1,
                            exten: '8000',
                            context: 'default',
                        }],
                }), new Line_1.default({
                    id: 3421,
                    extensions: [{
                            id: 2,
                            exten: '9980',
                            context: 'internal',
                        }],
                })],
            mobileNumber: '',
            username: 'john.doe',
            doNotDisturb: false,
            subscriptionType: 2,
            switchboards: [],
            status: '',
            callPickupTargetUsers: [{
                    uuid: 'uuid-0',
                    firstname: 'FirstName-0',
                    lastname: 'LastName-0',
                }],
            onlineCallRecordEnabled: true,
        }));
    });
});
