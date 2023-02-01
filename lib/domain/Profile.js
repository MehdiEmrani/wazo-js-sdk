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
exports.LINE_STATE = exports.STATE = void 0;
const Line_1 = __importDefault(require("./Line"));
const ForwardOption_1 = __importStar(require("./ForwardOption"));
const new_from_1 = __importDefault(require("../utils/new-from"));
exports.STATE = {
    AVAILABLE: 'available',
    UNAVAILABLE: 'unavailable',
    INVISIBLE: 'invisible',
    DISCONNECTED: 'disconnected',
    AWAY: 'away',
};
exports.LINE_STATE = {
    AVAILABLE: 'available',
    HOLDING: 'holding',
    RINGING: 'ringing',
    TALKING: 'talking',
    UNAVAILABLE: 'unavailable',
    PROGRESSING: 'progressing',
};
class Profile {
    static parse(plain) {
        return new Profile({
            id: plain.uuid,
            firstName: plain.firstName || plain.firstname || '',
            lastName: plain.lastName || plain.lastname || '',
            email: plain.email,
            lines: plain.lines.map(line => Line_1.default.parse(line)),
            username: plain.username,
            mobileNumber: plain.mobile_phone_number || '',
            ringSeconds: plain.ring_seconds,
            forwards: [ForwardOption_1.default.parse(plain.forwards.unconditional, ForwardOption_1.FORWARD_KEYS.UNCONDITIONAL), ForwardOption_1.default.parse(plain.forwards.noanswer, ForwardOption_1.FORWARD_KEYS.NO_ANSWER), ForwardOption_1.default.parse(plain.forwards.busy, ForwardOption_1.FORWARD_KEYS.BUSY)],
            doNotDisturb: plain.services.dnd.enabled,
            subscriptionType: plain.subscription_type,
            voicemail: plain.voicemail,
            switchboards: plain.switchboards || [],
            agent: plain.agent,
            status: '',
            callPickupTargetUsers: plain.call_pickup_target_users || [],
            onlineCallRecordEnabled: plain.online_call_record_enabled,
        });
    }
    static newFrom(profile) {
        return (0, new_from_1.default)(profile, Profile);
    }
    constructor({ id, firstName, lastName, email, lines, username, mobileNumber, forwards, doNotDisturb, state, subscriptionType, voicemail, switchboards, agent, status, ringSeconds, sipLines, callPickupTargetUsers, onlineCallRecordEnabled, }) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.lines = lines;
        this.username = username;
        this.mobileNumber = mobileNumber;
        this.forwards = forwards;
        this.doNotDisturb = doNotDisturb;
        this.state = state;
        this.voicemail = voicemail;
        this.subscriptionType = subscriptionType;
        this.switchboards = switchboards;
        this.agent = agent;
        this.status = status;
        this.callPickupTargetUsers = callPickupTargetUsers;
        this.onlineCallRecordEnabled = onlineCallRecordEnabled;
        this.ringSeconds = ringSeconds;
        this.sipLines = sipLines || [];
    }
    static getLinesState(lines) {
        let result = exports.LINE_STATE.UNAVAILABLE;
        // eslint-disable-next-line
        for (const line of lines) {
            if (line.state === exports.LINE_STATE.RINGING) {
                result = exports.LINE_STATE.RINGING;
                break;
            }
            if (line.state === exports.LINE_STATE.TALKING) {
                result = exports.LINE_STATE.TALKING;
                break;
            }
            if (line.state === exports.LINE_STATE.AVAILABLE) {
                result = exports.LINE_STATE.AVAILABLE;
            }
        }
        return result;
    }
    hasId(id) {
        return id === this.id;
    }
    setMobileNumber(number) {
        this.mobileNumber = number;
        return this;
    }
    setForwardOption(forwardOption) {
        const updatedForwardOptions = this.forwards.slice();
        const index = updatedForwardOptions.findIndex(forward => forward.is(forwardOption));
        updatedForwardOptions.splice(index, 1, forwardOption);
        this.forwards = updatedForwardOptions;
        return this;
    }
    setDoNotDisturb(enabled) {
        this.doNotDisturb = enabled;
        return this;
    }
    setState(state) {
        this.state = state;
        return this;
    }
}
exports.default = Profile;
