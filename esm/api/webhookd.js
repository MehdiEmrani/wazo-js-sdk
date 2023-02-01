import Subscription from '../domain/Subscription';
export default ((client, baseUrl) => ({
    getSubscriptions: () => client.get(`${baseUrl}/users/me/subscriptions`).then(Subscription.parseMany),
    getSubscription: (uuid) => client.get(`${baseUrl}/users/me/subscriptions/${uuid}`).then(Subscription.parse),
    createSubscription: (payload) => client.post(`${baseUrl}/users/me/subscriptions`, payload),
    removeSubscription: (uuid) => client.delete(`${baseUrl}/users/me/subscriptions/${uuid}`),
}));
