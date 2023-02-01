"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BACKEND = void 0;
const Profile_1 = require("./Profile");
const new_from_1 = __importDefault(require("../utils/new-from"));
exports.BACKEND = {
    OFFICE365: 'office365',
    PERSONAL: 'personal',
    GOOGLE: 'google',
    WAZO: 'wazo',
};
const SOURCE_MOBILE = 'mobile';
class Contact {
    static merge(oldContacts, newContacts) {
        return newContacts.map(current => {
            const old = oldContacts.find(contact => contact && contact.is(current));
            return old ? current.merge(old) : current;
        });
    }
    static sortContacts(a, b) {
        const aNames = a.separateName();
        const bNames = b.separateName();
        const aLastName = aNames.lastName;
        const bLastName = bNames.lastName;
        // last Name can be empty
        if (aLastName === bLastName) {
            return aNames.firstName.localeCompare(bNames.firstName);
        }
        return aLastName.localeCompare(bLastName);
    }
    static parseMany(response) {
        if (!response || !response.results) {
            return [];
        }
        return response.results.map(r => Contact.parse(r, response.column_types));
    }
    static manyGraphQlWithNumbersParser(numbers) {
        return (response) => {
            if (!response.data || !response.data.me || !response.data.me.contacts) {
                return [];
            }
            return response.data.me.contacts.edges.map((edge, i) => {
                if (!edge.node) {
                    return null;
                }
                const { email, } = edge.node;
                const name = edge.node.firstname && edge.node.lastname ? `${edge.node.firstname || ''} ${edge.node.lastname || ''}` : edge.node.wazoReverse;
                return new Contact({
                    name,
                    number: numbers[i],
                    numbers: [{
                            label: 'primary',
                            number: numbers[i],
                        }],
                    backend: edge.node.wazoBackend,
                    source: edge.node.wazoSourceName,
                    sourceId: edge.node.wazoSourceEntryId || '',
                    email: email || '',
                    emails: email ? [{
                            label: 'primary',
                            email,
                        }] : [],
                    uuid: edge.node.userUuid,
                });
            }).filter(contact => !!contact);
        };
    }
    static fetchNumbers(plain, columns) {
        const numberColumns = columns.map((e, index) => ({
            index,
            columnName: e,
        })).filter(e => e.columnName === 'number' || e.columnName === 'callable').map(e => e.index);
        return plain.column_values.filter((e, index) => numberColumns.some(i => i === index) && e !== null);
    }
    static parse(plain, columns) {
        const numbers = Contact.fetchNumbers(plain, columns);
        const email = plain.column_values[columns.indexOf('email')];
        return new Contact({
            name: plain.column_values[columns.indexOf('name')],
            number: numbers.length ? numbers[0] : '',
            numbers: numbers.map((number, i) => ({
                label: i === 0 ? 'primary' : 'secondary',
                number,
            })),
            favorited: plain.column_values[columns.indexOf('favorite')],
            email: email || '',
            emails: email ? [{
                    label: 'primary',
                    email,
                }] : [],
            entreprise: plain.column_values[columns.indexOf('entreprise')] || '',
            birthday: plain.column_values[columns.indexOf('birthday')] || '',
            address: plain.column_values[columns.indexOf('address')] || '',
            note: plain.column_values[columns.indexOf('note')] || '',
            endpointId: plain.relations.endpoint_id,
            personal: plain.column_values[columns.indexOf('personal')],
            source: plain.source,
            sourceId: plain.relations.source_entry_id || '',
            uuid: plain.relations.user_uuid,
            backend: plain.backend || '',
        });
    }
    static parseManyPersonal(results) {
        return results.map(r => Contact.parsePersonal(r));
    }
    static parsePersonal(plain) {
        return new Contact({
            name: `${plain.firstName || plain.firstname || ''} ${plain.lastName || plain.lastname || ''}`,
            number: plain.number || '',
            numbers: plain.number ? [{
                    label: 'primary',
                    number: plain.number,
                }] : [],
            email: plain.email || '',
            emails: plain.email ? [{
                    label: 'primary',
                    email: plain.email,
                }] : [],
            source: 'personal',
            sourceId: plain.id || '',
            entreprise: plain.entreprise || '',
            birthday: plain.birthday || '',
            address: plain.address || '',
            note: plain.note || '',
            favorited: plain.favorited,
            personal: true,
            backend: plain.backend || exports.BACKEND.PERSONAL,
        });
    }
    static parseMobile(plain) {
        let address = '';
        if (plain.postalAddresses.length) {
            const postalAddress = plain.postalAddresses[0];
            address = `${postalAddress.street} ${postalAddress.city} ${postalAddress.postCode} ${postalAddress.country}`;
        }
        return new Contact({
            name: `${plain.givenName || ''} ${plain.familyName || ''}`,
            number: plain.phoneNumbers.length ? plain.phoneNumbers[0].number : '',
            numbers: plain.phoneNumbers.length ? [{
                    label: 'primary',
                    number: plain.phoneNumbers[0].number,
                }] : [],
            email: plain.emailAddresses.length ? plain.emailAddresses[0].email : '',
            emails: plain.emailAddresses.length ? [{
                    label: 'primary',
                    email: plain.emailAddresses[0].email,
                }] : [],
            source: SOURCE_MOBILE,
            sourceId: plain.recordID || '',
            birthday: plain.birthday ? `${plain.birthday.year}-${plain.birthday.month}-${plain.birthday.day}` : '',
            address,
            note: plain.note || '',
            favorited: false,
            personal: true,
        });
    }
    static parseManyOffice365(response, source) {
        return response.map(r => Contact.parseOffice365(r, source));
    }
    static parseOffice365(single, source) {
        const emails = [];
        const numbers = [];
        if (single.emailAddresses) {
            single.emailAddresses.map(email => emails.push({
                email: email.address,
            }));
        }
        if (single.businessPhones) {
            single.businessPhones.map(phone => numbers.push({
                label: 'business',
                number: phone,
            }));
        }
        if (single.mobilePhone) {
            numbers.push({
                label: 'mobile',
                number: single.mobilePhone,
            });
        }
        if (single.homePhones) {
            single.homePhones.map(phone => numbers.push({
                label: 'home',
                number: phone,
            }));
        }
        return new Contact({
            sourceId: single.id || '',
            name: single.displayName || '',
            number: numbers.length ? numbers[0].number : '',
            numbers,
            emails,
            source: source.name,
            backend: exports.BACKEND.OFFICE365,
        });
    }
    static parseManyGoogle(response, source) {
        return response.map(r => Contact.parseGoogle(r, source));
    }
    static parseGoogle(single, source) {
        const emails = [];
        const numbers = [];
        if (single.emails) {
            single.emails.forEach((email) => (typeof email === 'object' ? {
                email: email.address,
                label: email.label,
            } : {
                email,
            }));
        }
        if (single.numbers_by_label) {
            Object.keys(single.numbers_by_label).forEach(label => numbers.push({
                label,
                number: single.numbers_by_label[label],
            }));
        }
        else if (single.numbers) {
            single.numbers.forEach(phone => numbers.push({
                number: phone,
            }));
        }
        return new Contact({
            sourceId: single.id || '',
            name: single.name || '',
            number: numbers.length ? numbers[0].number : '',
            numbers,
            emails,
            source: source.name,
            backend: exports.BACKEND.GOOGLE,
        });
    }
    static parseManyWazo(response, source) {
        return response.map(r => Contact.parseWazo(r, source));
    }
    static parseWazo(single, source) {
        const emails = [];
        const numbers = [];
        if (single.email) {
            emails.push({
                label: 'email',
                email: single.email,
            });
        }
        if (single.exten) {
            numbers.push({
                label: 'exten',
                number: single.exten,
            });
        }
        if (single.mobile_phone_number) {
            numbers.push({
                label: 'mobile',
                number: single.mobile_phone_number,
            });
        }
        return new Contact({
            uuid: single.uuid,
            sourceId: String(single.id) || '',
            name: `${single.firstname}${single.lastname ? ` ${single.lastname}` : ''}`,
            number: numbers.length ? numbers[0].number : '',
            numbers,
            emails,
            source: source.name,
            backend: exports.BACKEND.WAZO,
        });
    }
    static parseManyConference(response, source) {
        return response.map(r => Contact.parseConference(r, source));
    }
    static parseConference(single, source) {
        const numbers = [];
        let firstNumber = '';
        if (single && single.extensions && single.extensions.length > 0 && single.extensions[0].exten) {
            firstNumber = single.extensions[0].exten;
            numbers.push({
                label: 'exten',
                number: firstNumber,
            });
        }
        return new Contact({
            sourceId: String(single.id),
            name: single.name,
            number: firstNumber,
            numbers,
            source: source.name,
            backend: 'conference',
        });
    }
    static newFrom(contact) {
        return (0, new_from_1.default)(contact, Contact);
    }
    constructor({ id, uuid, name, number, numbers, email, emails, source, sourceId, entreprise, birthday, address, note, state, lineState, lastActivity, mobile, status, endpointId, personal, favorited, backend, personalStatus, sessions, connected, doNotDisturb, ringing, previousPresential, lines, } = {}) {
        this.id = id;
        this.uuid = uuid;
        this.name = name || '';
        this.number = number;
        this.numbers = numbers;
        this.email = email;
        this.emails = emails;
        this.source = source;
        this.sourceId = sourceId;
        this.entreprise = entreprise;
        this.birthday = birthday;
        this.address = address;
        this.note = note;
        this.state = state;
        this.lineState = lineState;
        this.lastActivity = lastActivity;
        this.mobile = mobile;
        this.status = status;
        this.endpointId = endpointId;
        this.personal = personal;
        this.favorited = favorited;
        this.backend = backend;
        this.personalStatus = personalStatus || '';
        this.sessions = sessions || [];
        this.connected = connected;
        this.doNotDisturb = doNotDisturb;
        this.ringing = ringing;
        this.previousPresential = previousPresential;
        this.lines = lines || [];
        // Useful to compare instead of instanceof with minified code
        this.type = 'Contact';
    }
    setFavorite(value) {
        this.favorited = value;
        return this;
    }
    is(other) {
        const sameSourceId = this.sourceId !== null && other.sourceId !== null && this.sourceId === other.sourceId;
        const sameUuid = !!this.uuid && !!other.uuid && this.uuid === other.uuid;
        const hasSameId = sameSourceId || sameUuid;
        const hasSameBackend = !!this.backend && !!other.backend && this.backend === other.backend;
        const hasSameSource = !!this.source && !!other.source && this.source === other.source;
        return !!other && hasSameId && hasSameBackend && hasSameSource;
    }
    hasId(id) {
        return this.uuid === id;
    }
    hasNumber(number) {
        return this.number === number;
    }
    hasEndpointId(endpointId) {
        return this.endpointId === endpointId;
    }
    isAvailable() {
        return this.state === Profile_1.STATE.AVAILABLE;
    }
    isAway() {
        return this.state === Profile_1.STATE.AWAY;
    }
    isUnavailable() {
        return this.state === Profile_1.STATE.UNAVAILABLE;
    }
    isInvisible() {
        return this.state === Profile_1.STATE.INVISIBLE;
    }
    isInCall() {
        return this.lineState === Profile_1.LINE_STATE.TALKING || this.lineState === Profile_1.LINE_STATE.HOLDING;
    }
    isRinging() {
        return this.ringing;
    }
    isInUseOrRinging() {
        return this.lineState === Profile_1.LINE_STATE.TALKING || this.lineState === Profile_1.LINE_STATE.RINGING;
    }
    isProgressing() {
        return this.lineState === Profile_1.LINE_STATE.PROGRESSING;
    }
    merge(old) {
        Object.keys(old).filter(key => key !== 'lineState').forEach(key => {
            // @ts-ignore
            this[key] = old[key] || this[key];
        });
        if (old.lineState) {
            this.lineState = old.lineState;
        }
        return this;
    }
    isIntern() {
        return !!this.uuid;
    }
    hasSourceId() {
        return !!this.sourceId;
    }
    isCallable(session) {
        return !!this.number && !!session && !session.is(this);
    }
    isFromMobile() {
        return this.source === SOURCE_MOBILE;
    }
    isFavorite() {
        return this.favorited;
    }
    separateName() {
        if (!this.name) {
            return {
                firstName: '',
                lastName: '',
            };
        }
        const names = this.name.split(/\s+/);
        const firstName = names[0];
        const lastName = names.slice(1).join(' ');
        return {
            firstName,
            lastName,
        };
    }
}
exports.default = Contact;
