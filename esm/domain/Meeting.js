import moment from 'moment';
import newFrom from '../utils/new-from';
export default class Meeting {
    type;
    guestSipAuthorization;
    uri;
    uuid;
    name;
    port;
    extension;
    persistent;
    ownerUuids;
    creationTime;
    pendingAuthorizations;
    requireAuthorization;
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
            creationTime: moment(plain.creation_time).toDate(),
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
        return newFrom(meeting, Meeting);
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
