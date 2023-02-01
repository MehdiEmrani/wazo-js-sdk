/* eslint-disable camelcase */
import ApiRequester from '../utils/api-requester';
import Relocation from '../domain/Relocation';
import ChatMessage from '../domain/ChatMessage';
import Voicemail from '../domain/Voicemail';
import Call from '../domain/Call';
import IndirectTransfer from '../domain/IndirectTransfer';
import MeetingStatus from '../domain/MeetingStatus';
export default ((client, baseUrl) => ({
    updatePresence: (presence) => client.put(`${baseUrl}/users/me/presences`, {
        presence,
    }, null, ApiRequester.successResponseParser),
    listMessages: (participantUuid, limit) => {
        const query = {};
        if (participantUuid) {
            query.participant_user_uuid = participantUuid;
        }
        if (limit) {
            query.limit = limit;
        }
        return client.get(`${baseUrl}/users/me/chats`, query).then((response) => ChatMessage.parseMany(response));
    },
    sendMessage: (alias, msg, toUserId) => {
        const body = {
            alias,
            msg,
            to: toUserId,
        };
        return client.post(`${baseUrl}/users/me/chats`, body, null, ApiRequester.successResponseParser);
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
    listCalls: () => client.get(`${baseUrl}/users/me/calls`, null).then((response) => Call.parseMany(response.items)),
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
        return client.post(`${baseUrl}/users/me/relocates`, body).then((response) => Relocation.parse(response));
    },
    listVoicemails: () => client.get(`${baseUrl}/users/me/voicemails`).then((response) => Voicemail.parseMany(response)),
    deleteVoicemail: (voicemailId) => client.delete(`${baseUrl}/users/me/voicemails/messages/${voicemailId}`),
    getVoicemailUrl: (voicemail) => {
        const body = {
            token: client.token,
        };
        return client.computeUrl('get', `${baseUrl}/users/me/voicemails/messages/${voicemail.id}/recording`, body);
    },
    fetchSwitchboardHeldCalls: (switchboardUuid) => client.get(`${baseUrl}/switchboards/${switchboardUuid}/calls/held`),
    holdSwitchboardCall: (switchboardUuid, callId) => client.put(`${baseUrl}/switchboards/${switchboardUuid}/calls/held/${callId}`, null, null, ApiRequester.successResponseParser),
    answerSwitchboardHeldCall: (switchboardUuid, callId, lineId = null) => client.put(`${baseUrl}/switchboards/${switchboardUuid}/calls/held/${callId}/answer${lineId ? `?line_id=${lineId}` : ''}`),
    fetchSwitchboardQueuedCalls: (switchboardUuid) => client.get(`${baseUrl}/switchboards/${switchboardUuid}/calls/queued`),
    answerSwitchboardQueuedCall: (switchboardUuid, callId, lineId = null) => client.put(`${baseUrl}/switchboards/${switchboardUuid}/calls/queued/${callId}/answer${lineId ? `?line_id=${lineId}` : ''}`),
    sendFax: (extension, fax, callerId = null) => {
        const headers = {
            'Content-type': 'application/pdf',
            'X-Auth-Token': client.token,
        };
        const params = ApiRequester.getQueryString({
            extension,
            caller_id: callerId,
        });
        return client.post(`${baseUrl}/users/me/faxes?${params}`, fax, headers);
    },
    getConferenceParticipantsAsUser: async (conferenceId) => client.get(`${baseUrl}/users/me/conferences/${conferenceId}/participants`),
    getMeetingParticipantsAsUser: async (meetingUuid) => client.get(`${baseUrl}/users/me/meetings/${meetingUuid}/participants`),
    banMeetingParticipant: (meetingUuid, participantUuid) => client.delete(`${baseUrl}/users/me/meetings/${meetingUuid}/participants/${participantUuid}`, null, null, ApiRequester.successResponseParser),
    listTrunks: () => client.get(`${baseUrl}/trunks`),
    mute: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/mute/start`, null, null, ApiRequester.successResponseParser),
    unmute: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/mute/stop`, null, null, ApiRequester.successResponseParser),
    hold: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/hold/start`, null, null, ApiRequester.successResponseParser),
    resume: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/hold/stop`, null, null, ApiRequester.successResponseParser),
    // eslint-disable-next-line camelcase
    transferCall: (initiator_call, exten, flow) => client.post(`${baseUrl}/users/me/transfers`, {
        initiator_call,
        exten,
        flow,
    }).then(IndirectTransfer.parseFromApi),
    confirmCallTransfer: (transferId) => client.put(`${baseUrl}/users/me/transfers/${transferId}/complete`, null, null, ApiRequester.successResponseParser),
    cancelCallTransfer: (transferId) => client.delete(`${baseUrl}/users/me/transfers/${transferId}`, null, null, ApiRequester.successResponseParser),
    sendDTMF: (callId, digits) => client.put(`${baseUrl}/users/me/calls/${callId}/dtmf?digits=${encodeURIComponent(digits)}`, null, null, ApiRequester.successResponseParser),
    // @deprecated: check for engine version >= 20.12 instead
    isAhHocConferenceAPIEnabled: () => client.head(`${baseUrl}/users/me/conferences/adhoc`, null, null, ApiRequester.successResponseParser),
    createAdHocConference: (hostCallId, participantCallIds) => client.post(`${baseUrl}/users/me/conferences/adhoc`, {
        host_call_id: hostCallId,
        participant_call_ids: participantCallIds,
    }),
    addAdHocConferenceParticipant: (conferenceId, callId) => client.put(`${baseUrl}/users/me/conferences/adhoc/${conferenceId}/participants/${callId}`, null, null, ApiRequester.successResponseParser),
    removeAdHocConferenceParticipant: (conferenceId, participantCallId) => client.delete(`${baseUrl}/users/me/conferences/adhoc/${conferenceId}/participants/${participantCallId}`, null, null, ApiRequester.successResponseParser),
    deleteAdHocConference: (conferenceId) => client.delete(`${baseUrl}/users/me/conferences/adhoc/${conferenceId}`, null, null, ApiRequester.successResponseParser),
    startRecording: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/record/start`, null, null, ApiRequester.successResponseParser),
    stopRecording: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/record/stop`, null, null, ApiRequester.successResponseParser),
    pauseRecording: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/record/pause`, null, null, ApiRequester.successResponseParser),
    resumeRecording: (callId) => client.put(`${baseUrl}/users/me/calls/${callId}/record/resume`, null, null, ApiRequester.successResponseParser),
    guestGetMeetingStatus: (meetingUuid) => client.get(`${baseUrl}/guests/me/meetings/${meetingUuid}/status`).then(MeetingStatus.parse),
}));
