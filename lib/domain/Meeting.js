"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const new_from_1 = __importDefault(require("../utils/new-from"));
class Meeting {
    static parse(plain) {
        return new Meeting({
            guestSipAuthorization: plain.guest_sip_authorization,
            uri: plain.ingress_http_uri,
            name: plain.name,
            ownerUuids: plain.owner_uuids,
            port: plain.port,
            uuid: plain.uuid,
            extension: plain.exten,
            persistent: plain.persistent,
            creationTime: (0, moment_1.default)(plain.creation_time).toDate(),
            requireAuthorization: plain.require_authorization,
        });
    }
    static parseMany(items) {
        if (!items) {
            return [];
        }
        return items.map(plain => Meeting.parse(plain));
    }
    static newFrom(meeting) {
        return (0, new_from_1.default)(meeting, Meeting);
    }
    constructor({ uuid, name, guestSipAuthorization, ownerUuids, port, uri, extension, persistent, creationTime, requireAuthorization, } = {}) {
        this.guestSipAuthorization = guestSipAuthorization;
        this.uri = uri;
        this.name = name;
        this.ownerUuids = ownerUuids;
        this.port = port;
        this.uuid = uuid;
        this.extension = extension;
        this.persistent = persistent;
        this.creationTime = creationTime;
        this.requireAuthorization = requireAuthorization;
        // Useful to compare instead of instanceof with minified code
        this.type = 'Meeting';
    }
    getGuestSipCredentials() {
        // eslint-disable-next-line no-undef
        const [username, secret] = Buffer.from(this.guestSipAuthorization, 'base64').toString('ascii').split(':');
        return {
            username,
            secret,
        };
    }
}
exports.default = Meeting;
