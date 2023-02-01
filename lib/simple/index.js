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
/* global window */
const Auth_1 = __importStar(require("./Auth"));
const Phone_1 = __importDefault(require("./Phone"));
const Websocket_1 = __importDefault(require("./Websocket"));
const Room_1 = __importDefault(require("./room/Room"));
const SipRoom_1 = __importDefault(require("./room/SipRoom"));
const RemoteParticipant_1 = __importDefault(require("./room/RemoteParticipant"));
const LocalParticipant_1 = __importDefault(require("./room/LocalParticipant"));
const Stream_1 = __importDefault(require("./room/Stream"));
const Directory_1 = __importDefault(require("./Directory"));
const Configuration_1 = __importDefault(require("./Configuration"));
const getApiClient_1 = __importDefault(require("../service/getApiClient"));
const utils_1 = require("./utils");
const web_rtc_client_1 = require("../web-rtc-client");
const BadResponse_1 = __importDefault(require("../domain/BadResponse"));
const ServerError_1 = __importDefault(require("../domain/ServerError"));
const SFUNotAvailableError_1 = __importDefault(require("../domain/SFUNotAvailableError"));
const Call_1 = __importDefault(require("../domain/Call"));
const CallLog_1 = __importDefault(require("../domain/CallLog"));
const Recording_1 = __importDefault(require("../domain/Recording"));
const ChatMessage_1 = __importDefault(require("../domain/ChatMessage"));
const ChatRoom_1 = __importDefault(require("../domain/ChatRoom"));
const Contact_1 = __importDefault(require("../domain/Contact"));
const ForwardOption_1 = __importDefault(require("../domain/ForwardOption"));
const Line_1 = __importDefault(require("../domain/Line"));
const NotificationOptions_1 = __importDefault(require("../domain/NotificationOptions"));
const Profile_1 = __importDefault(require("../domain/Profile"));
const Session_1 = __importDefault(require("../domain/Session"));
const Voicemail_1 = __importDefault(require("../domain/Voicemail"));
const Relocation_1 = __importDefault(require("../domain/Relocation"));
const Room_2 = __importDefault(require("../domain/Room"));
const CallSession_1 = __importDefault(require("../domain/CallSession"));
const WebRTCPhone_1 = __importDefault(require("../domain/Phone/WebRTCPhone"));
const CTIPhone_1 = __importDefault(require("../domain/Phone/CTIPhone"));
const IndirectTransfer_1 = __importDefault(require("../domain/IndirectTransfer"));
const SwitchboardCall_1 = __importDefault(require("../domain/SwitchboardCall"));
const IssueReporter_1 = __importDefault(require("../service/IssueReporter"));
const Features_1 = __importDefault(require("../domain/Features"));
const Meeting_1 = __importDefault(require("../domain/Meeting"));
const Checker_1 = __importDefault(require("../checker/Checker"));
const Wazo = {
    Auth: Auth_1.default,
    Phone: Phone_1.default,
    Websocket: Websocket_1.default,
    Room: Room_1.default,
    SipRoom: SipRoom_1.default,
    RemoteParticipant: RemoteParticipant_1.default,
    LocalParticipant: LocalParticipant_1.default,
    Stream: Stream_1.default,
    createLocalVideoStream: utils_1.createLocalVideoStream,
    createLocalAudioStream: utils_1.createLocalAudioStream,
    Configuration: Configuration_1.default,
    Directory: Directory_1.default,
    getApiClient: getApiClient_1.default,
    IssueReporter: IssueReporter_1.default,
    loggerFor: IssueReporter_1.default.loggerFor.bind(IssueReporter_1.default),
    Features: Features_1.default,
    Checker: Checker_1.default,
    // Domain
    domain: {
        BadResponse: BadResponse_1.default,
        ServerError: ServerError_1.default,
        Call: Call_1.default,
        CallLog: CallLog_1.default,
        CTIPhone: CTIPhone_1.default,
        Recording: Recording_1.default,
        ChatMessage: ChatMessage_1.default,
        ChatRoom: ChatRoom_1.default,
        Contact: Contact_1.default,
        ForwardOption: ForwardOption_1.default,
        Line: Line_1.default,
        NotificationOptions: NotificationOptions_1.default,
        Profile: Profile_1.default,
        Session: Session_1.default,
        Voicemail: Voicemail_1.default,
        Relocation: Relocation_1.default,
        ConferenceRoom: Room_2.default,
        CallSession: CallSession_1.default,
        IndirectTransfer: IndirectTransfer_1.default,
        SwitchboardCall: SwitchboardCall_1.default,
        WebRTCPhone: WebRTCPhone_1.default,
        Meeting: Meeting_1.default,
    },
    // Api
    get api() {
        return (0, getApiClient_1.default)();
    },
    get agentd() {
        return (0, getApiClient_1.default)().agentd;
    },
    get amid() {
        return (0, getApiClient_1.default)().amid;
    },
    get application() {
        return (0, getApiClient_1.default)().application;
    },
    get auth() {
        return (0, getApiClient_1.default)().auth;
    },
    get callLogd() {
        return (0, getApiClient_1.default)().callLogd;
    },
    get calld() {
        return (0, getApiClient_1.default)().calld;
    },
    get chatd() {
        return (0, getApiClient_1.default)().chatd;
    },
    get confd() {
        return (0, getApiClient_1.default)().confd;
    },
    get dird() {
        return (0, getApiClient_1.default)().dird;
    },
    get webhookd() {
        return (0, getApiClient_1.default)().webhookd;
    },
    // Error
    InvalidSubscription: Auth_1.InvalidSubscription,
    InvalidAuthorization: Auth_1.InvalidAuthorization,
    CanceledCallError: web_rtc_client_1.CanceledCallError,
    SFUNotAvailableError: SFUNotAvailableError_1.default,
    NoTenantIdError: Auth_1.NoTenantIdError,
    NoDomainNameError: Auth_1.NoDomainNameError,
};
if (window) {
    // @ts-ignore
    window.Wazo = Wazo;
}
if (global) {
    global.Wazo = Wazo;
}
exports.default = Wazo;
