import ApiClient from './api-client';
import WebRTCClient from './web-rtc-client';
import WebSocketClient from './websocket-client';
import Emitter from './utils/Emitter';
import BadResponse from './domain/BadResponse';
import ServerError from './domain/ServerError';
import SFUNotAvailableError from './domain/SFUNotAvailableError';
import Call from './domain/Call';
import CallLog from './domain/CallLog';
import Recording from './domain/Recording';
import ChatMessage from './domain/ChatMessage';
import ChatRoom from './domain/ChatRoom';
import Contact from './domain/Contact';
import ForwardOption from './domain/ForwardOption';
import Line from './domain/Line';
import NotificationOptions from './domain/NotificationOptions';
import Profile from './domain/Profile';
import Session from './domain/Session';
import Voicemail from './domain/Voicemail';
import Relocation from './domain/Relocation';
import Room from './domain/Room';
import CallSession from './domain/CallSession';
import IndirectTransfer from './domain/IndirectTransfer';
import SwitchboardCall from './domain/SwitchboardCall';
import WebRTCPhone from './domain/Phone/WebRTCPhone';
import CTIPhone from './domain/Phone/CTIPhone';
import Meeting from './domain/Meeting';
import type { NewContact as NewContactType, ContactResponse as ContactResponseType, ContactsResponse as ContactsResponseType, ContactPersonalResponse as ContactPersonalResponseType, ContactMobileResponse as ContactMobileResponseType } from './domain/Contact';
import type { Phone as PhoneType, PhoneEventCallbacks as PhoneEventCallbacksType } from './domain/Phone/Phone';
import type { ChatUser as ChatUserType } from './domain/ChatMessage';
import type { Device as DeviceType } from './domain/Device/Device';
import type { WebSocketMessage as WebSocketMessageType } from './types/WebSocketMessage';
import DebugDevice from './domain/Device/DebugDevice';
import Checker from './checker/Checker';
import ApiRequester from './utils/api-requester';
import type { DirectorySource as DirectorySourceType, DirectorySources as DirectorySourcesType } from './domain/DirectorySource';
import type { SwitchboardAnwseredQueuedCall as SwitchboardAnwseredQueuedCallType, SwitchboardAnwseredHeldCall as SwitchboardAnwseredHeldCallType, SwitchboardCallItem as SwitchboardCallItemType, SwitchboardCallItems as SwitchboardCallItemsType } from './domain/SwitchboardCall';
export type NewContact = NewContactType;
export type ContactResponse = ContactResponseType;
export type ContactsResponse = ContactsResponseType;
export type ContactPersonalResponse = ContactPersonalResponseType;
export type ContactMobileResponse = ContactMobileResponseType;
export type Phone = PhoneType;
export type PhoneEventCallbacks = PhoneEventCallbacksType;
export type Device = DeviceType;
export type ChatUser = ChatUserType;
export type Source = DirectorySourceType;
export type Sources = DirectorySourcesType;
export type SwitchboardAnwseredQueuedCall = SwitchboardAnwseredQueuedCallType;
export type SwitchboardAnwseredHeldCall = SwitchboardAnwseredHeldCallType;
export type SwitchboardCallItem = SwitchboardCallItemType;
export type SwitchboardCallItems = SwitchboardCallItemsType;
export type WebSocketMessage = WebSocketMessageType;
declare const _default: {
    ApiRequester: typeof ApiRequester;
    Checker: typeof Checker;
    Emitter: typeof Emitter;
    PhoneNumberUtil: libphonenumber.PhoneNumberUtil;
    PhoneNumberFormat: typeof libphonenumber.PhoneNumberFormat;
    AsYouTypeFormatter: typeof libphonenumber.AsYouTypeFormatter;
    getDisplayableNumber: (rawNumber: string, country: string, asYouType?: boolean) => string;
    getCallableNumber: (number: string, country: string | null | undefined) => string | null | undefined;
    WazoApiClient: typeof ApiClient;
    WazoWebRTCClient: typeof WebRTCClient;
    WazoWebSocketClient: typeof WebSocketClient;
    BadResponse: typeof BadResponse;
    ServerError: typeof ServerError;
    SFUNotAvailableError: typeof SFUNotAvailableError;
    Call: typeof Call;
    CallSession: typeof CallSession;
    CTIPhone: typeof CTIPhone;
    Features: {
        _hasChat: boolean;
        _hasVideo: boolean;
        _hasCallRecording: boolean;
        _hasFax: boolean;
        _hasMobileDoubleCall: boolean;
        _hasMobileGsm: boolean;
        _hasMeeting: boolean;
        fetchAccess(): Promise<void>;
        hasChat(): boolean;
        hasVideo(): boolean;
        hasCallRecording(): boolean;
        hasFax(): boolean;
        hasMobileDoubleCall(): boolean;
        hasMobileGsm(): boolean;
        hasMeeting(): boolean;
        _hasFeatures(scopes: Record<string, any>, featureName: string): boolean;
    };
    IndirectTransfer: typeof IndirectTransfer;
    SwitchboardCall: typeof SwitchboardCall;
    CallLog: typeof CallLog;
    Recording: typeof Recording;
    ChatMessage: typeof ChatMessage;
    ChatRoom: typeof ChatRoom;
    Contact: typeof Contact;
    COUNTRIES: {
        BELGIUM: string;
        CANADA: string;
        FRANCE: string;
        GERMANY: string;
        ISRAEL: string;
        ITALY: string;
        LUXEMBOURG: string;
        MALAYSIA: string;
        MONACO: string;
        NETHERLANDS: string;
        POLAND: string;
        PORTUGAL: string;
        UNITED_KINGDOM: string;
        UNITED_STATES: string;
        SPAIN: string;
        SWITZERLAND: string;
    };
    ForwardOption: typeof ForwardOption;
    Line: typeof Line;
    NotificationOptions: typeof NotificationOptions;
    Profile: typeof Profile;
    Session: typeof Session;
    Voicemail: typeof Voicemail;
    Relocation: typeof Relocation;
    Room: typeof Room;
    IssueReporter: {
        TRACE: string;
        INFO: string;
        LOG: string;
        WARN: string;
        ERROR: string;
        oldConsoleMethods: Record<string, any> | null;
        enabled: boolean;
        remoteClientConfiguration: Record<string, any> | null | undefined;
        buffer: Record<string, any>[];
        bufferTimeout: any;
        _boundProcessBuffer: (...args: any[]) => any;
        _boundParseLoggerBody: (...args: any[]) => any;
        _callback: ((...args: any[]) => any) | null | undefined;
        init(): void;
        setCallback(cb: (...args: any[]) => any): void;
        configureRemoteClient(configuration?: Record<string, any>): void;
        enable(): void;
        disable(): void;
        loggerFor(category: string): any;
        removeSlashes(str: string): string;
        log(level: string, ...args: any): void;
        logRequest(url: string, options: Record<string, any>, response: Record<string, any>, start: Date): void;
        getLogs(): never[];
        getParsedLogs(): never[];
        getReport(): string;
        _catchConsole(): void;
        _sendToRemoteLogger(level: string, payload?: Record<string, any>): void;
        _parseLoggerBody(payload: Record<string, any>): string;
        _addToBuffer(payload: Record<string, any>): void;
        _processBuffer(): void;
        _sendDebugToGrafana(payload: string | Record<string, any> | Record<string, any>[], retry?: number): void;
        _writeRetryCount(message: string | Record<string, any>, count: number): string | Record<string, any>;
        _isLevelAbove(level1: string, level2: string): boolean;
        _makeCategory(category: string): string;
    };
    DebugDevice: typeof DebugDevice;
    PROFILE_STATE: {
        AVAILABLE: string;
        UNAVAILABLE: string;
        INVISIBLE: string;
        DISCONNECTED: string;
        AWAY: string;
    };
    FORWARD_KEYS: {
        BUSY: string;
        NO_ANSWER: string;
        UNCONDITIONAL: string;
    };
    LINE_STATE: {
        AVAILABLE: string;
        HOLDING: string;
        RINGING: string;
        TALKING: string;
        UNAVAILABLE: string;
        PROGRESSING: string;
    };
    SOCKET_EVENTS: {
        ON_OPEN: string;
        ON_MESSAGE: string;
        ON_ERROR: string;
        ON_CLOSE: string;
        INITIALIZED: string;
        ON_AUTH_FAILED: string;
    };
    Wazo: {
        Auth: import("./simple/Auth").IAuth;
        Phone: import("./simple/Phone").IPhone;
        Websocket: import("./simple/Websocket").IWebsocket;
        Room: typeof import("./simple/room/Room").default;
        SipRoom: typeof import("./simple/room/SipRoom").default;
        RemoteParticipant: typeof import("./simple/room/RemoteParticipant").default;
        LocalParticipant: typeof import("./simple/room/LocalParticipant").default;
        Stream: typeof import("./simple/room/Stream").default;
        createLocalVideoStream: (options: Record<string, any>) => Promise<import("./simple/room/Stream").default>;
        createLocalAudioStream: (options: Record<string, any>) => Promise<import("./simple/room/Stream").default>;
        Configuration: any;
        Directory: any;
        getApiClient: (forServer?: string | null | undefined) => ApiClient;
        IssueReporter: {
            TRACE: string;
            INFO: string;
            LOG: string;
            WARN: string;
            ERROR: string;
            oldConsoleMethods: Record<string, any> | null;
            enabled: boolean;
            remoteClientConfiguration: Record<string, any> | null | undefined;
            buffer: Record<string, any>[];
            bufferTimeout: any;
            _boundProcessBuffer: (...args: any[]) => any;
            _boundParseLoggerBody: (...args: any[]) => any;
            _callback: ((...args: any[]) => any) | null | undefined;
            init(): void;
            setCallback(cb: (...args: any[]) => any): void;
            configureRemoteClient(configuration?: Record<string, any>): void;
            enable(): void;
            disable(): void;
            loggerFor(category: string): any;
            removeSlashes(str: string): string;
            log(level: string, ...args: any): void;
            logRequest(url: string, options: Record<string, any>, response: Record<string, any>, start: Date): void;
            getLogs(): never[];
            getParsedLogs(): never[];
            getReport(): string;
            _catchConsole(): void;
            _sendToRemoteLogger(level: string, payload?: Record<string, any>): void;
            _parseLoggerBody(payload: Record<string, any>): string;
            _addToBuffer(payload: Record<string, any>): void;
            _processBuffer(): void;
            _sendDebugToGrafana(payload: string | Record<string, any> | Record<string, any>[], retry?: number): void;
            _writeRetryCount(message: string | Record<string, any>, count: number): string | Record<string, any>;
            _isLevelAbove(level1: string, level2: string): boolean;
            _makeCategory(category: string): string;
        };
        loggerFor: (category: string) => any;
        Features: {
            _hasChat: boolean;
            _hasVideo: boolean;
            _hasCallRecording: boolean;
            _hasFax: boolean;
            _hasMobileDoubleCall: boolean;
            _hasMobileGsm: boolean;
            _hasMeeting: boolean;
            fetchAccess(): Promise<void>;
            hasChat(): boolean;
            hasVideo(): boolean;
            hasCallRecording(): boolean;
            hasFax(): boolean;
            hasMobileDoubleCall(): boolean;
            hasMobileGsm(): boolean;
            hasMeeting(): boolean;
            _hasFeatures(scopes: Record<string, any>, featureName: string): boolean;
        };
        Checker: typeof Checker;
        domain: {
            BadResponse: typeof BadResponse;
            ServerError: typeof ServerError;
            Call: typeof Call;
            CallLog: typeof CallLog;
            CTIPhone: typeof CTIPhone;
            Recording: typeof Recording;
            ChatMessage: typeof ChatMessage;
            ChatRoom: typeof ChatRoom;
            Contact: typeof Contact;
            ForwardOption: typeof ForwardOption;
            Line: typeof Line;
            NotificationOptions: typeof NotificationOptions;
            Profile: typeof Profile;
            Session: typeof Session;
            Voicemail: typeof Voicemail;
            Relocation: typeof Relocation;
            ConferenceRoom: typeof Room;
            CallSession: typeof CallSession;
            IndirectTransfer: typeof IndirectTransfer;
            SwitchboardCall: typeof SwitchboardCall;
            WebRTCPhone: typeof WebRTCPhone;
            Meeting: typeof Meeting;
        };
        readonly api: ApiClient;
        readonly agentd: import("./api/agentd").AgentD;
        readonly amid: import("./api/amid").AmiD;
        readonly application: import("./api/application").ApplicationD;
        readonly auth: import("./api/auth").AuthD;
        readonly callLogd: import("./api/call-logd").CallLogD;
        readonly calld: import("./api/calld").CallD;
        readonly chatd: import("./api/chatd").ChatD;
        readonly confd: import("./api/confd").ConfD;
        readonly dird: import("./api/dird").DirD;
        readonly webhookd: import("./api/webhookd").WebhookD;
        InvalidSubscription: typeof import("./simple/Auth").InvalidSubscription;
        InvalidAuthorization: typeof import("./simple/Auth").InvalidAuthorization;
        CanceledCallError: typeof import("./web-rtc-client").CanceledCallError;
        SFUNotAvailableError: typeof SFUNotAvailableError;
        NoTenantIdError: typeof import("./simple/Auth").NoTenantIdError;
        NoDomainNameError: typeof import("./simple/Auth").NoDomainNameError;
    };
    WebRTCPhone: typeof WebRTCPhone;
    Meeting: typeof Meeting;
};
export default _default;
//# sourceMappingURL=index.d.ts.map