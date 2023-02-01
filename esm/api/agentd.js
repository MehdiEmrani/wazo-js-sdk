import ApiRequester from '../utils/api-requester';
import Agent from '../domain/Agent';
export default ((client, baseUrl) => ({
    getAgent: (agentId) => client.get(`${baseUrl}/agents/by-id/${agentId}`, null).then(Agent.parse),
    login: (agentNumber, context, extension) => client.post(`${baseUrl}/agents/by-number/${agentNumber}/login`, {
        context,
        extension,
    }, null, ApiRequester.successResponseParser),
    loginWithLineId: (lineId) => client.post(`${baseUrl}/users/me/agents/login`, {
        line_id: lineId,
    }, null, ApiRequester.successResponseParser),
    logout: (agentNumber) => client.post(`${baseUrl}/agents/by-number/${agentNumber}/logoff`, null, null, ApiRequester.successResponseParser),
    pause: (agentNumber) => client.post(`${baseUrl}/agents/by-number/${agentNumber}/pause`, {
        reason: 'songbird_reason',
    }, null, ApiRequester.successResponseParser),
    resume: (agentNumber) => client.post(`${baseUrl}/agents/by-number/${agentNumber}/unpause`, null, null, ApiRequester.successResponseParser),
    getStatus: () => client.get(`${baseUrl}/users/me/agents`, null).then(Agent.parse),
    staticLogout: () => client.post(`${baseUrl}/users/me/agents/logoff`, null, null, ApiRequester.successResponseParser),
    staticPause: () => client.post(`${baseUrl}/users/me/agents/pause`, {
        reason: 'songbird_reason',
    }, null, ApiRequester.successResponseParser),
    staticResume: () => client.post(`${baseUrl}/users/me/agents/unpause`, null, null, ApiRequester.successResponseParser),
}));
