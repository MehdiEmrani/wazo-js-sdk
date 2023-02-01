export default ((client, baseUrl) => ({
    action: (action, args = {}) => client.post(`${baseUrl}/action/${action}`, args),
    getAors: async (endpoint) => {
        const rawEvents = await client.post(`${baseUrl}/action/PJSIPShowEndpoint`, {
            Endpoint: endpoint,
        });
        return rawEvents.filter((event) => event.Event === 'ContactStatusDetail');
    },
}));
