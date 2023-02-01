"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_client_1 = __importDefault(require("../../api-client"));
const ServerError_1 = __importDefault(require("../../domain/ServerError"));
exports.default = {
    name: 'API',
    check: (server, session) => __awaiter(void 0, void 0, void 0, function* () {
        const client = new api_client_1.default({
            server,
        });
        client.setToken(session.token);
        client.disableErrorLogging();
        const handleApiError = (apiName, error) => {
            const statusText = error instanceof ServerError_1.default ? 'server error' : 'api error';
            throw new Error(`${apiName} fails with status (${error.status}, ${statusText}) : ${error.message}`);
        };
        // Check simple API call
        try {
            yield client.auth.getPushNotificationSenderId(session.uuid);
            yield client.auth.getProviders(session.uuid);
        }
        catch (e) {
            handleApiError('wazo-auth', e);
        }
        try {
            yield client.callLogd.listCallLogs();
        }
        catch (e) {
            handleApiError('wazo-callogd', e);
        }
        try {
            yield client.calld.listCalls();
        }
        catch (e) {
            handleApiError('wazo-calld', e);
        }
        try {
            yield client.calld.listVoicemails();
        }
        catch (e) {
            // API throws a 404 when no voicemail
            if (e.status !== 404) {
                handleApiError('wazo-calld', e);
            }
        }
        try {
            yield client.chatd.getState(session.uuid);
            yield client.chatd.getContactStatusInfo(session.uuid);
            yield client.chatd.getUserRooms();
        }
        catch (e) {
            handleApiError('wazo-chatd', e);
        }
        try {
            yield client.confd.getInfos();
            yield client.confd.getUser(session.uuid);
        }
        catch (e) {
            handleApiError('wazo-confd', e);
        }
        try {
            yield client.dird.listPersonalContacts();
            yield client.dird.listFavorites(session.primaryContext());
            yield client.dird.fetchWazoSource(session.primaryContext());
            const conferenceSource = yield client.dird.fetchConferenceSource(session.primaryContext());
            yield client.dird.fetchConferenceContacts(conferenceSource.items[0]);
        }
        catch (e) {
            handleApiError('wazo-dird', e);
        }
        try {
            yield client.webhookd.getSubscriptions();
        }
        catch (e) {
            handleApiError('wazo-webhookd', e);
        }
    }),
};
