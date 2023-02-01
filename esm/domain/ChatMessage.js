import moment from 'moment';
import newFrom from '../utils/new-from';
export default class ChatMessage {
    type;
    uuid;
    content;
    date;
    alias;
    userUuid;
    roomUuid;
    read;
    static parseMany(plain) {
        if (!plain || !plain.items) {
            return [];
        }
        return plain.items.map(item => ChatMessage.parse(item));
    }
    static parse(plain) {
        return new ChatMessage({
            uuid: plain.uuid,
            date: moment(plain.created_at).toDate(),
            content: plain.content,
            alias: plain.alias,
            userUuid: plain.user_uuid,
            read: true,
            roomUuid: plain.room ? plain.room.uuid : null,
        });
    }
    static newFrom(message) {
        return newFrom(message, ChatMessage);
    }
    constructor({ uuid, date, content, userUuid, alias, roomUuid, read, } = {}) {
        this.uuid = uuid;
        this.date = date;
        this.content = content;
        this.userUuid = userUuid;
        this.alias = alias;
        this.roomUuid = roomUuid;
        // @TODO: change after message read status available
        this.read = read;
        // Useful to compare instead of instanceof with minified code
        this.type = 'ChatMessage';
    }
    is(other) {
        return this.uuid === other.uuid;
    }
    isIncoming(userUuid) {
        return this.userUuid !== userUuid;
    }
    acknowledge() {
        // @TODO: change after message read status available
        this.read = true;
        return this;
    }
}
