"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-nested-ternary */
const jsrsasign_1 = require("jsrsasign");
const pubkey_1 = __importDefault(require("../pubkey"));
const new_from_1 = __importDefault(require("../utils/new-from"));
const compare_version_1 = __importDefault(require("../utils/compare-version"));
const { jws } = jsrsasign_1.KJUR;
const swarmKey = (jsrsasign_1.KEYUTIL.getKey(pubkey_1.default));
const MINIMUM_WAZO_ENGINE_VERSION_FOR_DEFAULT_CONTEXT = '19.08';
class Session {
    static parse(plain) {
        const token = plain.data.metadata ? plain.data.metadata.jwt : null;
        let authorizations = [];
        // Add authorizations from JWT
        if (token) {
            const isValid = jws.JWS.verifyJWT(token, swarmKey, {
                alg: ['RS256'],
                // @ts-ignore
                verifyAt: new Date(),
            });
            if (isValid) {
                const decodedToken = jws.JWS.readSafeJSONString((0, jsrsasign_1.b64utoutf8)(token.split('.')[1]));
                authorizations = decodedToken ? decodedToken.authorizations : [];
            }
        }
        return new Session({
            token: plain.data.token,
            refreshToken: plain.data.refresh_token || null,
            uuid: plain.data.metadata ? plain.data.metadata.uuid : null,
            sessionUuid: plain.data.session_uuid,
            authorizations,
            acl: plain.data.acls ? plain.data.acls : plain.data.acl ? plain.data.acl : [],
            tenantUuid: plain.data.metadata ? plain.data.metadata.tenant_uuid : undefined,
            expiresAt: new Date(`${plain.data.utc_expires_at}z`),
            engineUuid: plain.data.xivo_uuid,
        });
    }
    static newFrom(profile) {
        return (0, new_from_1.default)(profile, Session);
    }
    constructor({ token, uuid, tenantUuid, profile, expiresAt, authorizations, acl, engineVersion, refreshToken, sessionUuid, engineUuid, }) {
        this.token = token;
        this.uuid = uuid;
        this.tenantUuid = tenantUuid || null;
        this.profile = profile;
        this.expiresAt = expiresAt;
        this.authorizations = authorizations || [];
        this.acl = acl || [];
        this.engineVersion = engineVersion;
        this.refreshToken = refreshToken;
        this.sessionUuid = sessionUuid;
        this.engineUuid = engineUuid;
    }
    hasExpired(date = new Date()) {
        return date >= this.expiresAt;
    }
    is(contact) {
        return Boolean(contact) && this.uuid === contact.uuid;
    }
    using(profile) {
        this.profile = profile;
        return this;
    }
    hasAuthorizations() {
        return this.authorizations && !!this.authorizations.length;
    }
    displayName() {
        return this.profile ? `${this.profile.firstName} ${this.profile.lastName}` : '';
    }
    hasAccessToVoicemail() {
        if (!this.profile) {
            return false;
        }
        return !!this.profile.voicemail;
    }
    primaryLine() {
        return this.profile && this.profile.lines.length > 0 ? this.profile.lines[0] : null;
    }
    primarySipLine() {
        return this.profile && this.profile.sipLines.length > 0 ? this.profile.sipLines[0] : null;
    }
    primaryWebRtcLine() {
        return this.profile && (this.profile.sipLines || []).find(sipLine => sipLine && sipLine.isWebRtc());
    }
    primaryCtiLine() {
        return this.profile && (this.profile.sipLines || []).find(sipLine => sipLine && !sipLine.isWebRtc());
    }
    primaryContext() {
        if (this.engineVersion) {
            if (this.hasEngineVersionGte(MINIMUM_WAZO_ENGINE_VERSION_FOR_DEFAULT_CONTEXT)) {
                return 'default';
            }
        }
        const line = this.primaryLine();
        return line && Array.isArray(line.extensions) && line.extensions.length > 0 ? line.extensions[0].context : 'default';
    }
    hasEngineVersionGte(version) {
        return this.engineVersion && (0, compare_version_1.default)(String(this.engineVersion), String(version)) >= 0;
    }
    primaryNumber() {
        const line = this.primaryLine();
        return line && Array.isArray(line.extensions) && line.extensions.length ? line.extensions[0].exten : null;
    }
    allLines() {
        return this.profile ? this.profile.lines || [] : [];
    }
    allNumbers() {
        const extensions = this.allLines().map(line => { var _a; return ((_a = line.extensions) === null || _a === void 0 ? void 0 : _a.map(extension => extension.exten)) || []; });
        if (!extensions.length) {
            return [];
        }
        return extensions.reduce((a, b) => a.concat(b));
    }
    hasExtension(extension) {
        return this.allNumbers().some(number => number === extension);
    }
    get acls() {
        console.warn('`acls` property of Session has been removed in Wazo\'s SDK, please use `acl` instead.');
        return this.acl;
    }
}
exports.default = Session;
