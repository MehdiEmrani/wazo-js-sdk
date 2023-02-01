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
/* eslint-disable camelcase */
const api_requester_1 = __importDefault(require("../utils/api-requester"));
const Relocation_1 = __importDefault(require("../domain/Relocation"));
const ChatMessage_1 = __importDefault(require("../domain/ChatMessage"));
const Voicemail_1 = __importDefault(require("../domain/Voicemail"));
const Call_1 = __importDefault(require("../domain/Call"));
const IndirectTransfer_1 = __importDefault(require("../domain/IndirectTransfer"));
const MeetingStatus_1 = __importDefault(require("../domain/MeetingStatus"));
exports.default = ((client, baseUrl) => ({
    updatePresence: (presence) => client.put(`${baseUrl}/users/me/presences`, {
        presence,
    }, null, api_requester_1.default.successResponseParser),
    listMessages: (participantUuid, limit) => {
        const query = {};
        if (participantUuid) {
            query.participant_user_uuid = participantUuid;
        }
        if (limit) {
            query.limit = limit;
        }
        return client.get(`${baseUrl}/users/me/chats`, query).then((response) => ChatMessage_1.default.parseMany(response));
    },
    sendMessage: (alias, msg, toUserId) => {
        const body = {
            alias,
            msg,
            to: toUserId,
        };
        return client.post(`${baseUrl}/users/me/chats`, body, null, api_requester_1.default.successResponseParser);
    },
    makeCall: (extension, fromMobile, lineId, allLines = false) => {
        const query = {
            from_mobile: fromMobile,
            extension,
        };
        if (lineId) {
            query.line_id = lineId;
        }
        if (allLines) {
            query.all_lines = true;
        }
        return client.post(`${baseUrl}/users/me/calls`, query);
    },
    cancelCall: (callId) => client.delete(`${baseUrl}/users/me/calls/${callId}`, null),
    listCalls: () => client.get(`${baseUrl}/users/me/calls`, null).then((response) => Call_1.default.parseMany(response.items)),
    relocateCall(callId, destination, lineId, contact) {
        const body = {
            completions: ['answer'],
            destination,
            initiator_call: callId,
            auto_answer: true,
        };
        if (lineId || contact) {
            body.location = {};
        }
        if (lineId) {
            body.location.line_id = lineId;
        }
        if (contact) {
            body.location.contact = contact;
        }
        return client.post(`${baseUrl}/users/me/relocates`, body).then((response) => Relocation_1.default.parse(response));
    },
    listVoicemails: () => client.get(`${baseUrl}/users/me/voicemails`).then((response) => Voicemail_1.default.parseMany(response)),
    deleteVoicemail: (voicemailId) => client.delete(`${baseUrl}/users/me/voicemails/messages/${voicemailId}`),
    getVoicemailUrl: (voicemail) => {
        const body = {
            token: client.token,
        };
        return client.computeUrl('get', `${baseUrl}/users/me/voicemails/messages/${voicemail.id}/recording`, body);
    },
    fetchSwitchboardHeldCalls: (switchboardUuid) => client.get(`${baseUrl}/switchboards/${switchboardUuid}/calls/held`),
    holdSwitchboardCall: (switchboardUuid, callId) => client.put(`${baseUrl}/switchboards/${switchboardUuid}/calls/held/${callId}`, null, null, api_requester_1.default.successResponseParser),
    answerSwitchboardHeldCall: (switchboardUuid, callId, lineId = null) => client.put(`${baseUrl}/switchboards/${switchboardUuid}/calls/held/${callId}/answer${lineId ? `?line_id=${lineId}` : ''}`),
    fetchSwitchboardQueuedCalls: (switchboardUuid) => client.get(`${baseUrl}/switchboards/${switchboardUuid}/calls/queued`),
    answerSwitchboardQueuedCall: (switchboardUuid, callId, lineId = null) => client.put(`${baseUrl}/switchboards/${switchboardUuid}/calls/queued/${callId}/answer${lineId ? `?line_id=${lineId}` : ''}`),
    sendFax: (extension, fax, callerId = null) => {
        const headers = {
            'Content-type': 'application/pdf',
            'X-Auth-Token': client.token,
        };
        const params = api_requester_1.default.getQueryString({
            extension,
            caller_id: callerId,
        });
        return client.post(`${baseUrl}/users/me/faxes?${params}`, fax, headers);
    },
    getConferenceParticipantsAsUser: (conferenceId) => __awaiter(void 0, void 0, void 0, function* () { return client.get(`${baseUrl}/users/me/conferences/${conferenceId}/participants`); }),
    getMeetingParticipantsAsUser: (meetingUuid) => __awaiter(void 0, void 0, void 0, function* () { return client.get(`${baseUrl}/users/me/meetings/${meetingUuid}/participants`); }),
    banMeetingParticipant: (meetingUuid, participantUuid) => client.delete(`${baseUrl}/users/me/meetings/${meetingUuid}/participants/${participantUuid}`, null, null, api_requester_1.default.successResponseParser),
    listTrunks: () => client.get(`${baseUrl}/trunks`),
    mute: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/mute/start`, null, null, api_requester_1.default.successResponseParser),
    unmute: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/mute/stop`, null, null, api_requester_1.default.successResponseParser),
    hold: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/hold/start`, null, null, api_requester_1.default.successResponseParser),
    resume: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/hold/stop`, null, null, api_requester_1.default.successResponseParser),
    // eslint-disable-next-line camelcase
    transferCall: (initiator_call, exten, flow) => client.post(`${baseUrl}/users/me/transfers`, {
        initiator_call,
        exten,
        flow,
    }).then(IndirectTransfer_1.default.parseFromApi),
    confirmCallTransfer: (transferId) => client.put(`${baseUrl}/users/me/transfers/${transferId}/complete`, null, null, api_requester_1.default.successResponseParser),
    cancelCallTransfer: (transferId) => client.delete(`${baseUrl}/users/me/transfers/${transferId}`, null, null, api_requester_1.default.successResponseParser),
    sendDTMF: (callId, digits) => client.put(`${baseUrl}/users/me/calls/${callId}/dtmf?digits=${encodeURIComponent(digits)}`, null, null, api_requester_1.default.successResponseParser),
    // @deprecated: check for engine version >= 20.12 instead
    isAhHocConferenceAPIEnabled: () => client.head(`${baseUrl}/users/me/conferences/adhoc`, null, null, api_requester_1.default.successResponseParser),
    createAdHocConference: (hostCallId, participantCallIds) => client.post(`${baseUrl}/users/me/conferences/adhoc`, {
        host_call_id: hostCallId,
        participant_call_ids: participantCallIds,
    }),
    addAdHocConferenceParticipant: (conferenceId, callId) => client.put(`${baseUrl}/users/me/conferences/adhoc/${conferenceId}/participants/${callId}`, null, null, api_requester_1.default.successResponseParser),
    removeAdHocConferenceParticipant: (conferenceId, participantCallId) => client.delete(`${baseUrl}/users/me/conferences/adhoc/${conferenceId}/participants/${participantCallId}`, null, null, api_requester_1.default.successResponseParser),
    deleteAdHocConference: (conferenceId) => client.delete(`${baseUrl}/users/me/conferences/adhoc/${conferenceId}`, null, null, api_requester_1.default.successResponseParser),
    startRecording: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/record/start`, null, null, api_requester_1.default.successResponseParser),
    stopRecording: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/record/stop`, null, null, api_requester_1.default.successResponseParser),
    pauseRecording: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/record/pause`, null, null, api_requester_1.default.successResponseParser),
    resumeRecording: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/record/resume`, null, null, api_requester_1.default.successResponseParser),
    guestGetMeetingStatus: (meetingUuid) => client.get(`${baseUrl}/guests/me/meetings/${meetingUuid}/status`).then(MeetingStatus_1.default.parse),
}));
