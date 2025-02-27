import authMethods from './api/auth';
import applicationMethods from './api/application';
import confdMethods from './api/confd';
import ctidNgMethods from './api/ctid-ng';
import dirdMethods from './api/dird';
import callLogdMethods from './api/call-logd';
import chatdMethods from './api/chatd';
import calldMethods from './api/calld';
import agentdMethods from './api/agentd';
import webhookdMethods from './api/webhookd';
import amidMethods from './api/amid';
import ApiRequester from './utils/api-requester';
import IssueReporter from './service/IssueReporter';
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
const logger = IssueReporter ? IssueReporter.loggerFor('api') : console;
export default class ApiClient {
    client;
    auth;
    application;
    confd;
    ctidNg;
    dird;
    callLogd;
    chatd;
    calld;
    agentd;
    webhookd;
    amid;
    refreshToken;
    onRefreshToken;
    onRefreshTokenError;
    refreshExpiration;
    refreshBackend;
    refreshTenantId;
    refreshDomainName;
    isMobile;
    fetchOptions;
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
        this.auth = authMethods(this.client, `auth/${AUTH_VERSION}`);
        this.application = applicationMethods(this.client, `calld/${APPLICATION_VERSION}/applications`);
        this.confd = confdMethods(this.client, `confd/${CONFD_VERSION}`);
        this.ctidNg = ctidNgMethods(this.client, `ctid-ng/${CTIDNG_VERSION}`);
        this.dird = dirdMethods(this.client, `dird/${DIRD_VERSION}`);
        this.callLogd = callLogdMethods(this.client, `call-logd/${CALL_LOGD_VERSION}`);
        this.chatd = chatdMethods(this.client, `chatd/${CHATD_VERSION}`);
        this.calld = calldMethods(this.client, `calld/${CALLD_VERSION}`);
        this.agentd = agentdMethods(this.client, `agentd/${AGENTD_VERSION}`);
        this.webhookd = webhookdMethods(this.client, `webhookd/${WEBHOOKD_VERSION}`);
        this.amid = amidMethods(this.client, `amid/${AMID_VERSION}`);
    }
    updateParameters({ server, agent, clientId, fetchOptions, }) {
        const refreshTokenCallback = this.refreshTokenCallback.bind(this);
        this.client = new ApiRequester({
            server,
            agent,
            refreshTokenCallback,
            clientId,
            fetchOptions,
        });
        this.initializeEndpoints();
    }
    async forceRefreshToken() {
        logger.info('forcing refresh token, calling callback');
        return this.refreshTokenCallback();
    }
    async refreshTokenCallback() {
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
            const session = await this.auth.refreshToken(this.refreshToken, this.refreshBackend, this.refreshExpiration, this.isMobile, this.refreshTenantId, this.refreshDomainName);
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
