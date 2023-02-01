import ApiRequester from '../utils/api-requester';
import Profile from '../domain/Profile';
import SipLine from '../domain/SipLine';
import ExternalApp from '../domain/ExternalApp';
import Meeting from '../domain/Meeting';
import MeetingAuthorization from '../domain/MeetingAuthorization';
import { convertKeysFromCamelToUnderscore } from '../utils/object';
export default ((client, baseUrl) => ({
    listUsers: () => client.get(`${baseUrl}/users`, null),
    getUser: (userUuid) => client.get(`${baseUrl}/users/${userUuid}`, null).then(Profile.parse),
    updateUser: (userUuid, profile) => {
        const body = {
            firstname: profile.firstName,
            lastname: profile.lastName,
            email: profile.email,
            mobile_phone_number: profile.mobileNumber,
        };
        return client.put(`${baseUrl}/users/${userUuid}`, body, null, ApiRequester.successResponseParser);
    },
    updateForwardOption: (userUuid, key, destination, enabled) => {
        const url = `${baseUrl}/users/${userUuid}/forwards/${key}`;
        return client.put(url, {
            destination,
            enabled,
        }, null, ApiRequester.successResponseParser);
    },
    updateDoNotDisturb: (userUuid, enabled) => client.put(`${baseUrl}/users/${userUuid}/services/dnd`, {
        enabled,
    }, null, ApiRequester.successResponseParser),
    getUserLineSip: (userUuid, lineId) => client.get(`${baseUrl}/users/${userUuid}/lines/${lineId}/associated/endpoints/sip?view=merged`).then(SipLine.parse),
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
    getExternalApps: (userUuid) => client.get(`${baseUrl}/users/${userUuid}/external/apps`).then(ExternalApp.parseMany),
    getExternalApp: async (userUuid, name) => {
        const url = `${baseUrl}/users/${userUuid}/external/apps/${name}?view=fallback`;
        try {
            return await client.get(url).then(ExternalApp.parse);
        }
        catch (e) {
            return null;
        }
    },
    getMyMeetings: () => client.get(`${baseUrl}/users/me/meetings`).then((response) => Meeting.parseMany(response.items)),
    createMyMeeting: (args) => client.post(`${baseUrl}/users/me/meetings`, convertKeysFromCamelToUnderscore(args)).then(Meeting.parse),
    updateMyMeeting: (meetingUuid, data) => client.put(`${baseUrl}/users/me/meetings/${meetingUuid}`, convertKeysFromCamelToUnderscore(data), null, ApiRequester.successResponseParser),
    deleteMyMeeting: (meetingUuid) => client.delete(`${baseUrl}/users/me/meetings/${meetingUuid}`, null),
    getMeeting: (meetingUuid) => client.get(`${baseUrl}/meetings/${meetingUuid}`, null).then(Meeting.parse),
    meetingAuthorizations: (meetingUuid) => client.get(`${baseUrl}/users/me/meetings/${meetingUuid}/authorizations`, null).then((response) => MeetingAuthorization.parseMany(response.items)),
    meetingAuthorizationReject: (meetingUuid, authorizationUuid) => client.put(`${baseUrl}/users/me/meetings/${meetingUuid}/authorizations/${authorizationUuid}/reject`, {}, null, ApiRequester.successResponseParser),
    meetingAuthorizationAccept: (meetingUuid, authorizationUuid) => client.put(`${baseUrl}/users/me/meetings/${meetingUuid}/authorizations/${authorizationUuid}/accept`, {}, null, ApiRequester.successResponseParser),
    guestGetMeeting: (meetingUuid) => client.get(`${baseUrl}/guests/me/meetings/${meetingUuid}`, null).then(Meeting.parse),
    guestAuthorizationRequest: (userUuid, meetingUuid, username) => client.post(`${baseUrl}/guests/${userUuid}/meetings/${meetingUuid}/authorizations`, {
        guest_name: username,
    }).then(MeetingAuthorization.parse),
    guestAuthorizationCheck: (userUuid, meetingUuid, authorizationUuid) => client.get(`${baseUrl}/guests/${userUuid}/meetings/${meetingUuid}/authorizations/${authorizationUuid}`, null),
}));
