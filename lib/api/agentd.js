"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_requester_1 = __importDefault(require("../utils/api-requester"));
const Agent_1 = __importDefault(require("../domain/Agent"));
exports.default = ((client, baseUrl) => ({
    getAgent: (agentId) => client.get(`${baseUrl}/agents/by-id/${agentId}`, null).then(Agent_1.default.parse),
    login: (agentNumber, context, extension) => client.post(`${baseUrl}/agents/by-number/${agentNumber}/login`, {
        context,
        extension,
    }, null, api_requester_1.default.successResponseParser),
    loginWithLineId: (lineId) => client.post(`${baseUrl}/users/me/agents/login`, {
        line_id: lineId,
    }, null, api_requester_1.default.successResponseParser),
    logout: (agentNumber) => client.post(`${baseUrl}/agents/by-number/${agentNumber}/logoff`, null, null, api_requester_1.default.successResponseParser),
    pause: (agentNumber) => client.post(`${baseUrl}/agents/by-number/${agentNumber}/pause`, {
        reason: 'songbird_reason',
    }, null, api_requester_1.default.successResponseParser),
    resume: (agentNumber) => client.post(`${baseUrl}/agents/by-number/${agentNumber}/unpause`, null, null, api_requester_1.default.successResponseParser),
    getStatus: () => client.get(`${baseUrl}/users/me/agents`, null).then(Agent_1.default.parse),
    staticLogout: () => client.post(`${baseUrl}/users/me/agents/logoff`, null, null, api_requester_1.default.successResponseParser),
    staticPause: () => client.post(`${baseUrl}/users/me/agents/pause`, {
        reason: 'songbird_reason',
    }, null, api_requester_1.default.successResponseParser),
    staticResume: () => client.post(`${baseUrl}/users/me/agents/unpause`, null, null, api_requester_1.default.successResponseParser),
}));
