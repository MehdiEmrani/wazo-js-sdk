import ApiClient from './api-client';
import WebRTCClient from './web-rtc-client';
import WebSocketClient, { SOCKET_EVENTS } from './websocket-client';
import Emitter from './utils/Emitter';
import IssueReporter from './service/IssueReporter';
// Domain
import BadResponse from './domain/BadResponse';
import ServerError from './domain/ServerError';
import SFUNotAvailableError from './domain/SFUNotAvailableError';
import Call from './domain/Call';
import CallLog from './domain/CallLog';
import Recording from './domain/Recording';
import ChatMessage from './domain/ChatMessage';
import ChatRoom from './domain/ChatRoom';
import Contact from './domain/Contact';
import COUNTRIES from './domain/Country';
import Features from './domain/Features';
import ForwardOption, { FORWARD_KEYS } from './domain/ForwardOption';
import Line from './domain/Line';
import NotificationOptions from './domain/NotificationOptions';
import Profile, { STATE as PROFILE_STATE, LINE_STATE } from './domain/Profile';
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
import DebugDevice from './domain/Device/DebugDevice';
import Checker from './checker/Checker';
import { PhoneNumberUtil, PhoneNumberFormat, AsYouTypeFormatter, getDisplayableNumber, getCallableNumber } from './utils/PhoneNumberUtil';
import ApiRequester from './utils/api-requester';
import Wazo from './simple/index';
export default {
    ApiRequester,
    Checker,
    Emitter,
    PhoneNumberUtil,
    PhoneNumberFormat,
    AsYouTypeFormatter,
    getDisplayableNumber,
    getCallableNumber,
    WazoApiClient: ApiClient,
    WazoWebRTCClient: WebRTCClient,
    WazoWebSocketClient: WebSocketClient,
    BadResponse,
    ServerError,
    SFUNotAvailableError,
    Call,
    CallSession,
    CTIPhone,
    Features,
    IndirectTransfer,
    SwitchboardCall,
    CallLog,
    Recording,
    ChatMessage,
    ChatRoom,
    Contact,
    COUNTRIES,
    ForwardOption,
    Line,
    NotificationOptions,
    Profile,
    Session,
    Voicemail,
    Relocation,
    Room,
    IssueReporter,
    DebugDevice,
    PROFILE_STATE,
    FORWARD_KEYS,
    LINE_STATE,
    SOCKET_EVENTS,
    Wazo,
    WebRTCPhone,
    Meeting,
};
