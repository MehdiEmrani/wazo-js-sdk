import ApiRequester from '../utils/api-requester';
import Profile from '../domain/Profile';
import ChatRoom from '../domain/ChatRoom';
import ChatMessage from '../domain/ChatMessage';
export default ((client, baseUrl) => ({
    updateState: (contactUuid, state) => client.put(`${baseUrl}/users/${contactUuid}/presences`, {
        state,
    }, null, ApiRequester.successResponseParser),
    updateStatus: (contactUuid, state, status) => {
        const body = {
            state,
            status,
        };
        return client.put(`${baseUrl}/users/${contactUuid}/presences`, body, null, ApiRequester.successResponseParser);
    },
    getState: async (contactUuid) => client.get(`${baseUrl}/users/${contactUuid}/presences`).then((response) => response.state),
    getContactStatusInfo: async (contactUuid) => client.get(`${baseUrl}/users/${contactUuid}/presences`).then((response) => response),
    getLineState: async (contactUuid) => client.get(`${baseUrl}/users/${contactUuid}/presences`).then((response) => Profile.getLinesState(response.lines)),
    getMultipleLineState: async (contactUuids) => {
        const body = {};
        if (contactUuids && contactUuids.length) {
            body.user_uuid = contactUuids.join(',');
        }
        return client.get(`${baseUrl}/users/presences`, body).then((response) => response.items);
    },
    getUserRooms: async () => client.get(`${baseUrl}/users/me/rooms`).then(ChatRoom.parseMany),
    createRoom: async (name, users) => client.post(`${baseUrl}/users/me/rooms`, {
        name,
        users,
    }).then(ChatRoom.parse),
    getRoomMessages: async (roomUuid, params) => {
        const qs = ApiRequester.getQueryString(params || {});
        return client.get(`${baseUrl}/users/me/rooms/${roomUuid}/messages${qs.length ? `?${qs}` : ''}`).then((response) => ChatMessage.parseMany(response));
    },
    sendRoomMessage: async (roomUuid, message) => client.post(`${baseUrl}/users/me/rooms/${roomUuid}/messages`, message).then(ChatMessage.parse),
    getMessages: async (options) => client.get(`${baseUrl}/users/me/rooms/messages`, options),
}));
