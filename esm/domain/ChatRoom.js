import newFrom from '../utils/new-from';
export default class ChatRoom {
    type;
    uuid;
    name;
    users;
    static parseMany(plain) {
        if (!plain || !plain.items) {
            return [];
        }
        return plain.items.map(item => ChatRoom.parse(item));
    }
    static parse(plain) {
        return new ChatRoom({
            uuid: plain.uuid,
            name: plain.name,
            users: plain.users,
        });
    }
    static newFrom(room) {
        return newFrom(room, ChatRoom);
    }
    constructor({ uuid, name, users, } = {}) {
        this.uuid = uuid;
        this.name = name;
        this.users = users;
        // Useful to compare instead of instanceof with minified code
        this.type = 'ChatRoom';
    }
}
