import ApiRequester from '../utils/api-requester';
import type { UUID } from '../domain/types';
import ChatRoom from '../domain/ChatRoom';
import type { ChatUser } from '../domain/ChatMessage';
import ChatMessage from '../domain/ChatMessage';
export type PresenceResponse = {
    lines: Array<{
        id: number;
        state: string;
    }>;
    sessions: Array<{
        mobile: boolean;
        uuid: string;
    }>;
    state: string;
    status: string;
    user_uuid: string;
};
type GetMessagesOptions = {
    direction: string | null | undefined;
    limit: number | null | undefined;
    order: string | null | undefined;
    offset: string | null | undefined;
    search: string | null | undefined;
    distinct: string | null | undefined;
};
export interface ChatD {
    updateState: (contactUuid: UUID, state: string) => Promise<boolean>;
    updateStatus: (contactUuid: UUID, state: string, status: string) => Promise<boolean>;
    getState: (contactUuid: UUID) => Promise<string>;
    getContactStatusInfo: (contactUuid: UUID) => Promise<PresenceResponse>;
    getLineState: (contactUuid: UUID) => Promise<string>;
    getMultipleLineState: (contactUuids: Array<UUID> | null | undefined) => Promise<string>;
    getUserRooms: () => Promise<Array<ChatRoom>>;
    createRoom: (name: string, users: Array<ChatUser>) => Promise<ChatRoom>;
    getRoomMessages: (roomUuid: string, params?: GetMessagesOptions) => Promise<Array<ChatMessage>>;
    sendRoomMessage: (roomUuid: string, message: ChatMessage) => Promise<ChatMessage>;
    getMessages: (options: GetMessagesOptions) => Promise<ChatMessage>;
}
declare const _default: (client: ApiRequester, baseUrl: string) => ChatD;
export default _default;
//# sourceMappingURL=chatd.d.ts.map