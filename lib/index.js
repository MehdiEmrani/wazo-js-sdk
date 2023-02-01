"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_client_1 = __importDefault(require("./api-client"));
const web_rtc_client_1 = __importDefault(require("./web-rtc-client"));
const websocket_client_1 = __importStar(require("./websocket-client"));
const Emitter_1 = __importDefault(require("./utils/Emitter"));
const IssueReporter_1 = __importDefault(require("./service/IssueReporter"));
// Domain
const BadResponse_1 = __importDefault(require("./domain/BadResponse"));
const ServerError_1 = __importDefault(require("./domain/ServerError"));
const SFUNotAvailableError_1 = __importDefault(require("./domain/SFUNotAvailableError"));
const Call_1 = __importDefault(require("./domain/Call"));
const CallLog_1 = __importDefault(require("./domain/CallLog"));
const Recording_1 = __importDefault(require("./domain/Recording"));
const ChatMessage_1 = __importDefault(require("./domain/ChatMessage"));
const ChatRoom_1 = __importDefault(require("./domain/ChatRoom"));
const Contact_1 = __importDefault(require("./domain/Contact"));
const Country_1 = __importDefault(require("./domain/Country"));
const Features_1 = __importDefault(require("./domain/Features"));
const ForwardOption_1 = __importStar(require("./domain/ForwardOption"));
const Line_1 = __importDefault(require("./domain/Line"));
const NotificationOptions_1 = __importDefault(require("./domain/NotificationOptions"));
const Profile_1 = __importStar(require("./domain/Profile"));
const Session_1 = __importDefault(require("./domain/Session"));
const Voicemail_1 = __importDefault(require("./domain/Voicemail"));
const Relocation_1 = __importDefault(require("./domain/Relocation"));
const Room_1 = __importDefault(require("./domain/Room"));
const CallSession_1 = __importDefault(require("./domain/CallSession"));
const IndirectTransfer_1 = __importDefault(require("./domain/IndirectTransfer"));
const SwitchboardCall_1 = __importDefault(require("./domain/SwitchboardCall"));
const WebRTCPhone_1 = __importDefault(require("./domain/Phone/WebRTCPhone"));
const CTIPhone_1 = __importDefault(require("./domain/Phone/CTIPhone"));
const Meeting_1 = __importDefault(require("./domain/Meeting"));
const DebugDevice_1 = __importDefault(require("./domain/Device/DebugDevice"));
const Checker_1 = __importDefault(require("./checker/Checker"));
const PhoneNumberUtil_1 = require("./utils/PhoneNumberUtil");
const api_requester_1 = __importDefault(require("./utils/api-requester"));
const index_1 = __importDefault(require("./simple/index"));
exports.default = {
    ApiRequester: api_requester_1.default,
    Checker: Checker_1.default,
    Emitter: Emitter_1.default,
    PhoneNumberUtil: PhoneNumberUtil_1.PhoneNumberUtil,
    PhoneNumberFormat: PhoneNumberUtil_1.PhoneNumberFormat,
    AsYouTypeFormatter: PhoneNumberUtil_1.AsYouTypeFormatter,
    getDisplayableNumber: PhoneNumberUtil_1.getDisplayableNumber,
    getCallableNumber: PhoneNumberUtil_1.getCallableNumber,
    WazoApiClient: api_client_1.default,
    WazoWebRTCClient: web_rtc_client_1.default,
    WazoWebSocketClient: websocket_client_1.default,
    BadResponse: BadResponse_1.default,
    ServerError: ServerError_1.default,
    SFUNotAvailableError: SFUNotAvailableError_1.default,
    Call: Call_1.default,
    CallSession: CallSession_1.default,
    CTIPhone: CTIPhone_1.default,
    Features: Features_1.default,
    IndirectTransfer: IndirectTransfer_1.default,
    SwitchboardCall: SwitchboardCall_1.default,
    CallLog: CallLog_1.default,
    Recording: Recording_1.default,
    ChatMessage: ChatMessage_1.default,
    ChatRoom: ChatRoom_1.default,
    Contact: Contact_1.default,
    COUNTRIES: Country_1.default,
    ForwardOption: ForwardOption_1.default,
    Line: Line_1.default,
    NotificationOptions: NotificationOptions_1.default,
    Profile: Profile_1.default,
    Session: Session_1.default,
    Voicemail: Voicemail_1.default,
    Relocation: Relocation_1.default,
    Room: Room_1.default,
    IssueReporter: IssueReporter_1.default,
    DebugDevice: DebugDevice_1.default,
    PROFILE_STATE: Profile_1.STATE,
    FORWARD_KEYS: ForwardOption_1.FORWARD_KEYS,
    LINE_STATE: Profile_1.LINE_STATE,
    SOCKET_EVENTS: websocket_client_1.SOCKET_EVENTS,
    Wazo: index_1.default,
    WebRTCPhone: WebRTCPhone_1.default,
    Meeting: Meeting_1.default,
};
