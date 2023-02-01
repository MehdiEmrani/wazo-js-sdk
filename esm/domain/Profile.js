import Line from './Line';
import ForwardOption, { FORWARD_KEYS } from './ForwardOption';
import newFrom from '../utils/new-from';
export const STATE = {
    AVAILABLE: 'available',
    UNAVAILABLE: 'unavailable',
    INVISIBLE: 'invisible',
    DISCONNECTED: 'disconnected',
    AWAY: 'away',
};
export const LINE_STATE = {
    AVAILABLE: 'available',
    HOLDING: 'holding',
    RINGING: 'ringing',
    TALKING: 'talking',
    UNAVAILABLE: 'unavailable',
    PROGRESSING: 'progressing',
};
export default class Profile {
    id;
    firstName;
    lastName;
    email;
    lines;
    sipLines;
    username;
    mobileNumber;
    forwards;
    doNotDisturb;
    onlineCallRecordEnabled;
    state;
    ringSeconds;
    voicemail;
    status;
    subscriptionType;
    agent;
    switchboards;
    callPickupTargetUsers;
    static parse(plain) {
        return new Profile({
            id: plain.uuid,
            firstName: plain.firstName || plain.firstname || '',
            lastName: plain.lastName || plain.lastname || '',
            email: plain.email,
            lines: plain.lines.map(line => Line.parse(line)),
            username: plain.username,
            mobileNumber: plain.mobile_phone_number || '',
            ringSeconds: plain.ring_seconds,
            forwards: [ForwardOption.parse(plain.forwards.unconditional, FORWARD_KEYS.UNCONDITIONAL), ForwardOption.parse(plain.forwards.noanswer, FORWARD_KEYS.NO_ANSWER), ForwardOption.parse(plain.forwards.busy, FORWARD_KEYS.BUSY)],
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
        return newFrom(profile, Profile);
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
        let result = LINE_STATE.UNAVAILABLE;
        // eslint-disable-next-line
        for (const line of lines) {
            if (line.state === LINE_STATE.RINGING) {
                result = LINE_STATE.RINGING;
                break;
            }
            if (line.state === LINE_STATE.TALKING) {
                result = LINE_STATE.TALKING;
                break;
            }
            if (line.state === LINE_STATE.AVAILABLE) {
                result = LINE_STATE.AVAILABLE;
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
