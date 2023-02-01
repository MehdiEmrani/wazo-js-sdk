import ApiRequester from '../utils/api-requester';
import type { UUID, ListConfdUsersResponse, ListApplicationsResponse } from '../domain/types';
import type { MeetingCreateArguments, MeetingUpdateArguments } from '../domain/Meeting';
import Profile from '../domain/Profile';
import SipLine from '../domain/SipLine';
import ExternalApp from '../domain/ExternalApp';
import Meeting from '../domain/Meeting';
import MeetingAuthorization from '../domain/MeetingAuthorization';
export interface ConfD {
    listUsers: () => Promise<ListConfdUsersResponse>;
    getUser: (userUuid: string) => Promise<Profile>;
    updateUser: (userUuid: string, profile: Profile) => Promise<boolean>;
    updateForwardOption: (userUuid: string, key: string, destination: string, enabled: boolean) => Promise<boolean>;
    updateDoNotDisturb: (userUuid: UUID, enabled: boolean) => Promise<boolean>;
    getUserLineSip: (userUuid: string, lineId: string) => Promise<SipLine>;
    getUserLinesSip: (userUuid: string, lineIds: string[]) => Promise<(SipLine | null)[]>;
    getUserLineSipFromToken: (userUuid: string) => Promise<any>;
    listApplications: () => Promise<ListApplicationsResponse>;
    getInfos: () => Promise<{
        uuid: string;
        wazo_version: string;
    }>;
    getExternalApps: (userUuid: string) => Promise<ExternalApp[]>;
    getExternalApp: (userUuid: string, name: string) => Promise<ExternalApp | null | undefined>;
    getMyMeetings: () => Promise<Meeting>;
    createMyMeeting: (args: MeetingCreateArguments) => Promise<Meeting>;
    updateMyMeeting: (meetingUuid: string, data: MeetingUpdateArguments) => Promise<boolean>;
    deleteMyMeeting: (meetingUuid: string) => Promise<Meeting>;
    getMeeting: (meetingUuid: string) => Promise<Meeting>;
    meetingAuthorizations: (meetingUuid: string) => Promise<Array<MeetingAuthorization>>;
    meetingAuthorizationReject: (meetingUuid: string, authorizationUuid: string) => Promise<boolean>;
    meetingAuthorizationAccept: (meetingUuid: string, authorizationUuid: string) => Promise<boolean>;
    guestGetMeeting: (meetingUuid: string) => Promise<Meeting>;
    guestAuthorizationRequest: (userUuid: string, meetingUuid: string, username: string) => Promise<any>;
    guestAuthorizationCheck: (userUuid: string, meetingUuid: string, authorizationUuid: string) => Promise<any>;
}
declare const _default: (client: ApiRequester, baseUrl: string) => ConfD;
export default _default;
//# sourceMappingURL=confd.d.ts.map