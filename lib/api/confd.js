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
const api_requester_1 = __importDefault(require("../utils/api-requester"));
const Profile_1 = __importDefault(require("../domain/Profile"));
const SipLine_1 = __importDefault(require("../domain/SipLine"));
const ExternalApp_1 = __importDefault(require("../domain/ExternalApp"));
const Meeting_1 = __importDefault(require("../domain/Meeting"));
const MeetingAuthorization_1 = __importDefault(require("../domain/MeetingAuthorization"));
const object_1 = require("../utils/object");
exports.default = ((client, baseUrl) => ({
    listUsers: () => client.get(`${baseUrl}/users`, null),
    getUser: (userUuid) => client.get(`${baseUrl}/users/${userUuid}`, null).then(Profile_1.default.parse),
    updateUser: (userUuid, profile) => {
        const body = {
            firstname: profile.firstName,
            lastname: profile.lastName,
            email: profile.email,
            mobile_phone_number: profile.mobileNumber,
        };
        return client.put(`${baseUrl}/users/${userUuid}`, body, null, api_requester_1.default.successResponseParser);
    },
    updateForwardOption: (userUuid, key, destination, enabled) => {
        const url = `${baseUrl}/users/${userUuid}/forwards/${key}`;
        return client.put(url, {
            destination,
            enabled,
        }, null, api_requester_1.default.successResponseParser);
    },
    updateDoNotDisturb: (userUuid, enabled) => client.put(`${baseUrl}/users/${userUuid}/services/dnd`, {
        enabled,
    }, null, api_requester_1.default.successResponseParser),
    getUserLineSip: (userUuid, lineId) => client.get(`${baseUrl}/users/${userUuid}/lines/${lineId}/associated/endpoints/sip?view=merged`).then(SipLine_1.default.parse),
    getUserLinesSip(userUuid, lineIds) {
        // We have to catch all exception, unless Promise.all will returns an empty array for 2 lines with a custom one:
        // The custom line will throw a 404 and break the Promise.all.
        return Promise.all(lineIds.map(lineId => this.getUserLineSip(userUuid, lineId).catch(() => null)));
    },
    getUserLineSipFromToken(userUuid) {
        return this.getUser(userUuid).then(user => {
            if (!user.lines.length) {
                console.warn(`No sip line for user: ${userUuid}`);
                return null;
            }
            const line = user.lines[0];
            return this.getUserLineSip(userUuid, line.uuid || line.id);
        });
    },
    listApplications: () => client.get(`${baseUrl}/applications`, null),
    getInfos: () => client.get(`${baseUrl}/infos`, null),
    getExternalApps: (userUuid) => client.get(`${baseUrl}/users/${userUuid}/external/apps`).then(ExternalApp_1.default.parseMany),
    getExternalApp: (userUuid, name) => __awaiter(void 0, void 0, void 0, function* () {
        const url = `${baseUrl}/users/${userUuid}/external/apps/${name}?view=fallback`;
        try {
            return yield client.get(url).then(ExternalApp_1.default.parse);
        }
        catch (e) {
            return null;
        }
    }),
    getMyMeetings: () => client.get(`${baseUrl}/users/me/meetings`).then((response) => Meeting_1.default.parseMany(response.items)),
    createMyMeeting: (args) => client.post(`${baseUrl}/users/me/meetings`, (0, object_1.convertKeysFromCamelToUnderscore)(args)).then(Meeting_1.default.parse),
    updateMyMeeting: (meetingUuid, data) => client.put(`${baseUrl}/users/me/meetings/${meetingUuid}`, (0, object_1.convertKeysFromCamelToUnderscore)(data), null, api_requester_1.default.successResponseParser),
    deleteMyMeeting: (meetingUuid) => client.delete(`${baseUrl}/users/me/meetings/${meetingUuid}`, null),
    getMeeting: (meetingUuid) => client.get(`${baseUrl}/meetings/${meetingUuid}`, null).then(Meeting_1.default.parse),
    meetingAuthorizations: (meetingUuid) => client.get(`${baseUrl}/users/me/meetings/${meetingUuid}/authorizations`, null).then((response) => MeetingAuthorization_1.default.parseMany(response.items)),
    meetingAuthorizationReject: (meetingUuid, authorizationUuid) => client.put(`${baseUrl}/users/me/meetings/${meetingUuid}/authorizations/${authorizationUuid}/reject`, {}, null, api_requester_1.default.successResponseParser),
    meetingAuthorizationAccept: (meetingUuid, authorizationUuid) => client.put(`${baseUrl}/users/me/meetings/${meetingUuid}/authorizations/${authorizationUuid}/accept`, {}, null, api_requester_1.default.successResponseParser),
    guestGetMeeting: (meetingUuid) => client.get(`${baseUrl}/guests/me/meetings/${meetingUuid}`, null).then(Meeting_1.default.parse),
    guestAuthorizationRequest: (userUuid, meetingUuid, username) => client.post(`${baseUrl}/guests/${userUuid}/meetings/${meetingUuid}/authorizations`, {
        guest_name: username,
    }).then(MeetingAuthorization_1.default.parse),
    guestAuthorizationCheck: (userUuid, meetingUuid, authorizationUuid) => client.get(`${baseUrl}/guests/${userUuid}/meetings/${meetingUuid}/authorizations/${authorizationUuid}`, null),
}));
