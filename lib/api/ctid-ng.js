"use strict";
/* eslint-disable camelcase */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* DEPRECATED: USE CALLD INSTEAD CTID-NG */
const api_requester_1 = __importDefault(require("../utils/api-requester"));
const Relocation_1 = __importDefault(require("../domain/Relocation"));
const ChatMessage_1 = __importDefault(require("../domain/ChatMessage"));
const Voicemail_1 = __importDefault(require("../domain/Voicemail"));
const Call_1 = __importDefault(require("../domain/Call"));
const CTIPhone_1 = require("../domain/Phone/CTIPhone");
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
        return client.get(`${baseUrl}/users/me/chats`, query).then(ChatMessage_1.default.parseMany);
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
    cancelCall: (callId) => client.delete(`${baseUrl}/users/me/calls/${callId}`),
    listCalls: () => client.get(`${baseUrl}/users/me/calls`).then((response) => Call_1.default.parseMany(response.items)),
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
        return client.post(`${baseUrl}/users/me/relocates`, body).then(Relocation_1.default.parse);
    },
    transferCall(callId, number, flow = CTIPhone_1.TRANSFER_FLOW_BLIND) {
        const body = {
            exten: number,
            flow,
            initiator_call: callId,
        };
        return client.post(`${baseUrl}/users/me/transfers`, body);
    },
    // @TODO: fix response type
    cancelCallTransfer: (transferId) => client.delete(`${baseUrl}/users/me/transfers/${transferId}`),
    // @TODO: fix response type
    confirmCallTransfer: (transferId) => client.put(`${baseUrl}/users/me/transfers/${transferId}/complete`),
    listVoicemails: () => client.get(`${baseUrl}/users/me/voicemails`, null).then((response) => Voicemail_1.default.parseMany(response)),
    deleteVoicemail: (voicemailId) => client.delete(`${baseUrl}/users/me/voicemails/messages/${voicemailId}`, null),
    getPresence: (contactUuid) => client.get(`${baseUrl}/users/${contactUuid}/presences`, null),
    getStatus: (lineUuid) => client.get(`${baseUrl}/lines/${lineUuid}/presences`, null),
    fetchSwitchboardHeldCalls: (switchboardUuid) => client.get(`${baseUrl}/switchboards/${switchboardUuid}/calls/held`, null),
    holdSwitchboardCall: (switchboardUuid, callId) => client.put(`${baseUrl}/switchboards/${switchboardUuid}/calls/held/${callId}`, null, null, api_requester_1.default.successResponseParser),
    answerSwitchboardHeldCall: (switchboardUuid, callId) => client.put(`${baseUrl}/switchboards/${switchboardUuid}/calls/held/${callId}/answer`, null),
    fetchSwitchboardQueuedCalls: (switchboardUuid) => client.get(`${baseUrl}/switchboards/${switchboardUuid}/calls/queued`, null),
    answerSwitchboardQueuedCall: (switchboardUuid, callId) => client.put(`${baseUrl}/switchboards/${switchboardUuid}/calls/queued/${callId}/answer`, null),
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
}));
