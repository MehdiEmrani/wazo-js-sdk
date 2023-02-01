import type Session from '../domain/Session';
import WazoWebSocketClient from '../websocket-client';
import { IEmitter } from '../utils/Emitter';
export interface IWebsocket extends IEmitter {
    ws: WazoWebSocketClient | null | undefined;
    eventLists: string[];
    CONFERENCE_USER_PARTICIPANT_JOINED: string;
    CONFERENCE_USER_PARTICIPANT_LEFT: string;
    MEETING_USER_PARTICIPANT_JOINED: string;
    MEETING_USER_PARTICIPANT_LEFT: string;
    CALL_CREATED: string;
    open: (host: string, session: Session) => void;
    updateToken: (token: string) => void;
    isOpen: () => boolean;
    close: (force?: boolean) => void;
}
declare const _default: any;
export default _default;
//# sourceMappingURL=Websocket.d.ts.map