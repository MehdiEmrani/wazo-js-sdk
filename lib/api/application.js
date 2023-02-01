"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable camelcase */
const api_requester_1 = __importDefault(require("../utils/api-requester"));
exports.default = ((client, baseUrl) => ({
    bridgeCall(applicationUuid, callId, context, exten, autoanswer, displayed_caller_id_number) {
        const url = `${baseUrl}/${applicationUuid}/nodes`;
        const body = {
            calls: [{
                    id: callId,
                }],
        };
        return client.post(url, body, null, (res) => res.json().then((response) => response.uuid)).then((nodeUuid) => client.post(`${url}/${nodeUuid}/calls`, {
            context,
            exten,
            autoanswer,
            displayed_caller_id_number,
        }).then((data) => ({
            nodeUuid,
            data,
        })));
    },
    answerCall: (applicationUuid, callId) => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/answer`, {}, null, api_requester_1.default.successResponseParser),
    calls: (applicationUuid) => client.get(`${baseUrl}/${applicationUuid}/calls`),
    hangupCall: (applicationUuid, callId) => client.delete(`${baseUrl}/${applicationUuid}/calls/${callId}`),
    startPlaybackCall: (applicationUuid, callId, language, uri) => client.post(`${baseUrl}/${applicationUuid}/calls/${callId}/playbacks`, {
        language,
        uri,
    }),
    stopPlaybackCall: (applicationUuid, playbackUuid) => client.delete(`${baseUrl}/${applicationUuid}/playbacks/${playbackUuid}`),
    startProgressCall: (applicationUuid, callId) => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/progress/start`, {}, null, api_requester_1.default.successResponseParser),
    stopProgressCall: (applicationUuid, callId) => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/progress/stop`, {}, null, api_requester_1.default.successResponseParser),
    startMohCall: (applicationUuid, callId, mohUuid) => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/moh/${mohUuid}/start`, {}, null, api_requester_1.default.successResponseParser),
    stopMohCall: (applicationUuid, callId) => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/moh/stop`, {}, null, api_requester_1.default.successResponseParser),
    startHoldCall: (applicationUuid, callId) => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/hold/start`, {}, null, api_requester_1.default.successResponseParser),
    stopHoldCall: (applicationUuid, callId) => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/hold/stop`, {}, null, api_requester_1.default.successResponseParser),
    startMuteCall: (applicationUuid, callId) => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/mute/start`, {}, null, api_requester_1.default.successResponseParser),
    stopMuteCall: (applicationUuid, callId) => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/mute/stop`, {}, null, api_requester_1.default.successResponseParser),
    sendDTMFCall: (applicationUuid, callId, digits) => client.put(`${baseUrl}/${applicationUuid}/calls/${callId}/dtmf`, {
        digits,
    }, null, api_requester_1.default.successResponseParser),
    addCallNodes: (applicationUuid, nodeUuid, callId) => client.put(`${baseUrl}/${applicationUuid}/nodes/${nodeUuid}/calls/${callId}`, {}, null, api_requester_1.default.successResponseParser),
    createNewNodeWithCall: (applicationUuid, calls) => client.post(`${baseUrl}/${applicationUuid}/nodes`, {
        calls,
    }),
    addNewCallNodes: (applicationUuid, nodeUuid, context, exten, autoanswer) => client.post(`${baseUrl}/${applicationUuid}/nodes/${nodeUuid}/calls`, {
        context,
        exten,
        autoanswer,
    }),
    listCallsNodes: (applicationUuid, nodeUuid) => client.get(`${baseUrl}/${applicationUuid}/nodes/${nodeUuid}`),
    listNodes: (applicationUuid) => client.get(`${baseUrl}/${applicationUuid}/nodes`),
    removeNode: (applicationUuid, nodeUuid) => client.delete(`${baseUrl}/${applicationUuid}/nodes/${nodeUuid}`),
    removeCallNodes: (applicationUuid, nodeUuid, callId) => client.delete(`${baseUrl}/${applicationUuid}/nodes/${nodeUuid}/calls/${callId}`),
    listSnoop: (applicationUuid) => client.get(`${baseUrl}/${applicationUuid}/snoops`),
    removeSnoop: (applicationUuid, snoopUuid) => client.delete(`${baseUrl}/${applicationUuid}/snoops/${snoopUuid}`),
    viewSnoop: (applicationUuid, snoopUuid) => client.get(`${baseUrl}/${applicationUuid}/snoops/${snoopUuid}`),
    createSnoop: (applicationUuid, callId, snoopingCallId, whisperMode) => client.post(`${baseUrl}/${applicationUuid}/calls/${callId}/snoops`, {
        snooping_call_id: snoopingCallId,
        whisper_mode: whisperMode,
    }),
    updateSnoop: (applicationUuid, snoopUuid, whisperMode) => client.put(`${baseUrl}/${applicationUuid}/snoops/${snoopUuid}`, {
        whisper_mode: whisperMode,
    }, null, api_requester_1.default.successResponseParser),
}));
