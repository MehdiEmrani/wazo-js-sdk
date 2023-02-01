"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const new_from_1 = __importDefault(require("../utils/new-from"));
const availableCodecs = ['vp8', 'vp9', 'h264'];
class SipLine {
    static parse(plain) {
        let { username, secret, host, } = plain;
        // Since 20.13 engine so options are now in section
        if (plain.auth_section_options) {
            const findOption = (options, name) => options.find(option => option[0] === name);
            const usernameOption = findOption(plain.auth_section_options, 'username');
            const secretOption = findOption(plain.auth_section_options, 'password');
            const hostOption = findOption(plain.endpoint_section_options, 'media_address');
            username = usernameOption ? usernameOption[1] : '';
            secret = secretOption ? secretOption[1] : '';
            host = hostOption ? hostOption[1] : '';
        }
        return new SipLine({
            id: plain.id,
            uuid: plain.uuid,
            tenantUuid: plain.tenant_uuid,
            username,
            secret,
            type: plain.type,
            host,
            options: plain.options,
            endpointSectionOptions: plain.endpoint_section_options,
            links: plain.links,
            trunk: plain.trunk,
            line: plain.line,
        });
    }
    static newFrom(sipLine) {
        return (0, new_from_1.default)(sipLine, SipLine);
    }
    is(line) {
        if (line.uuid) {
            return this.uuid === line.uuid;
        }
        return this.id === line.id;
    }
    getOptions() {
        // `options` params have beend remove since 20.13... we should now use endpointSectionOptions
        return this.endpointSectionOptions || this.options || [];
    }
    isWebRtc() {
        return this.getOptions().some(option => option[0] === 'webrtc' && option[1] === 'yes');
    }
    hasVideo() {
        const allow = this.getOptions().find(option => option[0] === 'allow');
        return Array.isArray(allow) && allow[1].split(',').some((codec) => availableCodecs.some(c => c === codec));
    }
    hasVideoConference() {
        return this.getOptions().some(option => option[0] === 'max_audio_streams' && parseInt(option[1], 10) > 0) && this.getOptions().some(option => option[0] === 'max_video_streams' && parseInt(option[1], 10) > 1);
    }
    constructor({ id, uuid, tenantUuid, username, secret, type, host, options, endpointSectionOptions, links, trunk, line, }) {
        this.id = id;
        this.uuid = uuid;
        this.tenantUuid = tenantUuid;
        this.username = username;
        this.secret = secret;
        this.type = type;
        this.host = host;
        this.options = options;
        this.endpointSectionOptions = endpointSectionOptions;
        this.links = links;
        this.trunk = trunk;
        this.line = line;
        // Useful to compare instead of instanceof with minified code
        this.type = 'SipLine';
    }
}
exports.default = SipLine;
