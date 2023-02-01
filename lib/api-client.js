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
const auth_1 = __importDefault(require("./api/auth"));
const application_1 = __importDefault(require("./api/application"));
const confd_1 = __importDefault(require("./api/confd"));
const ctid_ng_1 = __importDefault(require("./api/ctid-ng"));
const dird_1 = __importDefault(require("./api/dird"));
const call_logd_1 = __importDefault(require("./api/call-logd"));
const chatd_1 = __importDefault(require("./api/chatd"));
const calld_1 = __importDefault(require("./api/calld"));
const agentd_1 = __importDefault(require("./api/agentd"));
const webhookd_1 = __importDefault(require("./api/webhookd"));
const amid_1 = __importDefault(require("./api/amid"));
const api_requester_1 = __importDefault(require("./utils/api-requester"));
const IssueReporter_1 = __importDefault(require("./service/IssueReporter"));
const AUTH_VERSION = '0.1';
const APPLICATION_VERSION = '1.0';
const CONFD_VERSION = '1.1';
const CTIDNG_VERSION = '1.0';
const DIRD_VERSION = '0.1';
const CALL_LOGD_VERSION = '1.0';
const CHATD_VERSION = '1.0';
const CALLD_VERSION = '1.0';
const AGENTD_VERSION = '1.0';
const WEBHOOKD_VERSION = '1.0';
const AMID_VERSION = '1.0';
const logger = IssueReporter_1.default ? IssueReporter_1.default.loggerFor('api') : console;
class ApiClient {
    // @see https://github.com/facebook/flow/issues/183#issuecomment-358607052
    constructor({ server, agent = null, refreshToken, clientId, isMobile = false, fetchOptions, }) {
        this.updateParameters({
            server,
            agent,
            clientId,
            fetchOptions,
        });
        this.refreshToken = refreshToken;
        this.isMobile = isMobile || false;
    }
    initializeEndpoints() {
        this.auth = (0, auth_1.default)(this.client, `auth/${AUTH_VERSION}`);
        this.application = (0, application_1.default)(this.client, `calld/${APPLICATION_VERSION}/applications`);
        this.confd = (0, confd_1.default)(this.client, `confd/${CONFD_VERSION}`);
        this.ctidNg = (0, ctid_ng_1.default)(this.client, `ctid-ng/${CTIDNG_VERSION}`);
        this.dird = (0, dird_1.default)(this.client, `dird/${DIRD_VERSION}`);
        this.callLogd = (0, call_logd_1.default)(this.client, `call-logd/${CALL_LOGD_VERSION}`);
        this.chatd = (0, chatd_1.default)(this.client, `chatd/${CHATD_VERSION}`);
        this.calld = (0, calld_1.default)(this.client, `calld/${CALLD_VERSION}`);
        this.agentd = (0, agentd_1.default)(this.client, `agentd/${AGENTD_VERSION}`);
        this.webhookd = (0, webhookd_1.default)(this.client, `webhookd/${WEBHOOKD_VERSION}`);
        this.amid = (0, amid_1.default)(this.client, `amid/${AMID_VERSION}`);
    }
    updateParameters({ server, agent, clientId, fetchOptions, }) {
        const refreshTokenCallback = this.refreshTokenCallback.bind(this);
        this.client = new api_requester_1.default({
            server,
            agent,
            refreshTokenCallback,
            clientId,
            fetchOptions,
        });
        this.initializeEndpoints();
    }
    forceRefreshToken() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('forcing refresh token, calling callback');
            return this.refreshTokenCallback();
        });
    }
    refreshTokenCallback() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('refresh token callback called', {
                refreshToken: this.refreshToken,
                refreshBackend: this.refreshBackend,
                refreshTenantId: this.refreshTenantId,
                refreshDomainName: this.refreshDomainName,
                refreshExpiration: this.refreshExpiration,
                isMobile: this.isMobile,
            });
            if (!this.refreshToken) {
                return null;
            }
            try {
                const session = yield this.auth.refreshToken(this.refreshToken, this.refreshBackend, this.refreshExpiration, this.isMobile, this.refreshTenantId, this.refreshDomainName);
                if (!session) {
                    return null;
                }
                logger.info('token refreshed', {
                    token: session.token,
                });
                if (this.onRefreshToken) {
                    this.onRefreshToken(session.token, session);
                }
                this.setToken(session.token);
                return session.token;
            }
            catch (error) {
                logger.error('token refresh, error', error);
                if (this.onRefreshTokenError) {
                    this.onRefreshTokenError(error);
                }
            }
        });
    }
    setToken(token) {
        this.client.setToken(token);
    }
    setTenant(tenant) {
        this.client.setTenant(tenant);
    }
    setRefreshToken(refreshToken) {
        this.refreshToken = refreshToken;
    }
    setClientId(clientId) {
        this.client.clientId = clientId;
    }
    setOnRefreshToken(onRefreshToken) {
        this.onRefreshToken = onRefreshToken;
    }
    setOnRefreshTokenError(callback) {
        this.onRefreshTokenError = callback;
    }
    setRefreshExpiration(refreshExpiration) {
        this.refreshExpiration = refreshExpiration;
    }
    setRefreshBackend(refreshBackend) {
        this.refreshBackend = refreshBackend;
    }
    setRefreshTenantId(tenantId) {
        console.warn('Use of `setRefreshTenantId` is deprecated, use `setRefreshDomainName` instead');
        this.refreshTenantId = tenantId;
    }
    setRefreshDomainName(domainName) {
        this.refreshDomainName = domainName;
    }
    setIsMobile(isMobile) {
        this.isMobile = isMobile;
    }
    setFetchOptions(fetchOptions) {
        this.fetchOptions = fetchOptions;
        this.client.setFetchOptions(fetchOptions);
    }
    disableErrorLogging() {
        this.client.disableErrorLogging();
    }
}
exports.default = ApiClient;
