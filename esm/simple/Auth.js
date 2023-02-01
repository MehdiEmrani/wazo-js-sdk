import { BACKEND_LDAP_USER, DEFAULT_BACKEND_USER, DETAULT_EXPIRATION } from '../api/auth';
import getApiClient, { setCurrentServer, setApiToken, setRefreshToken, setApiClientId, setRefreshExpiration, setOnRefreshToken, setFetchOptions, setRefreshTenantId, setRefreshDomainName, setOnRefreshTokenError } from '../service/getApiClient';
import IssueReporter from '../service/IssueReporter';
import Wazo from './index';
import SipLine from '../domain/SipLine';
export class InvalidSubscription extends Error {
}
export class InvalidAuthorization extends Error {
}
export class NoTenantIdError extends Error {
}
export class NoDomainNameError extends Error {
}
const logger = IssueReporter.loggerFor('simple-auth');
class Auth {
    clientId;
    expiration;
    minSubscriptionType;
    authorizationName;
    host;
    session;
    onRefreshTokenCallback;
    onRefreshTokenCallbackError;
    authenticated;
    mobile;
    BACKEND_WAZO;
    BACKEND_LDAP;
    constructor() {
        this.expiration = DETAULT_EXPIRATION;
        this.authenticated = false;
        this.minSubscriptionType = null;
        this.BACKEND_WAZO = DEFAULT_BACKEND_USER;
        this.BACKEND_LDAP = BACKEND_LDAP_USER;
    }
    init(clientId, expiration, minSubscriptionType, authorizationName, mobile) {
        this.clientId = clientId;
        this.expiration = expiration;
        this.minSubscriptionType = typeof minSubscriptionType === 'undefined' ? null : minSubscriptionType;
        this.authorizationName = authorizationName;
        this.host = null;
        this.session = null;
        this.mobile = mobile || false;
        setApiClientId(this.clientId);
        setRefreshExpiration(this.expiration);
        setOnRefreshToken((token, session) => {
            logger.info('on refresh token done', {
                token,
            });
            setApiToken(token);
            Wazo.Websocket.updateToken(token);
            if (this.onRefreshTokenCallback) {
                this.onRefreshTokenCallback(token, session);
            }
        });
        setOnRefreshTokenError(error => {
            logger.error('on refresh token error', error);
            if (this.onRefreshTokenCallbackError) {
                this.onRefreshTokenCallbackError(error);
            }
        });
    }
    setFetchOptions(options) {
        setFetchOptions(options);
    }
    async logIn(username, password, backend, extra) {
        let tenantId = null;
        let domainName = null;
        if (typeof extra === 'string') {
            tenantId = extra;
        }
        if (extra && typeof extra === 'object') {
            domainName = extra.domainName;
        }
        if (backend && backend !== this.BACKEND_WAZO && !tenantId && !domainName) {
            if (!tenantId) {
                throw new NoTenantIdError('No tenant id');
            }
            if (!domainName) {
                throw new NoDomainNameError('No domain name');
            }
        }
        this.authenticated = false;
        this.session = null;
        const rawSession = await getApiClient().auth.logIn({
            username,
            password,
            backend: backend,
            tenantId: tenantId,
            domainName: domainName,
            expiration: this.expiration,
            mobile: this.mobile,
        });
        if (backend) {
            getApiClient().setRefreshBackend(backend);
        }
        if (tenantId) {
            getApiClient().setRefreshTenantId(tenantId);
        }
        if (domainName) {
            getApiClient().setRefreshDomainName(domainName);
        }
        return this._onAuthenticated(rawSession);
    }
    async logInViaRefreshToken(refreshToken) {
        const rawSession = await getApiClient().auth.refreshToken(refreshToken, '', this.expiration, this.mobile);
        return this._onAuthenticated(rawSession);
    }
    async validateToken(token, refreshToken) {
        if (!token) {
            return;
        }
        if (refreshToken) {
            setRefreshToken(refreshToken);
        }
        // Check if the token is valid
        try {
            const rawSession = await getApiClient().auth.authenticate(token);
            return this._onAuthenticated(rawSession);
        }
        catch (e) {
            logger.error('on validate token error', e);
            console.warn(e);
        }
    }
    async generateNewToken(refreshToken) {
        return getApiClient().auth.refreshToken(refreshToken, '', this.expiration);
    }
    async logout(deleteRefreshToken = true) {
        try {
            Wazo.Websocket.close(true);
            if (this.clientId && deleteRefreshToken) {
                await getApiClient().auth.deleteRefreshToken(this.clientId);
            }
        }
        catch (e) { // Nothing to
        }
        try {
            await getApiClient().auth.logOut(this.session?.token || '');
        }
        catch (e) { // Nothing to
        }
        setApiToken(null);
        setRefreshToken(null);
        this.session = null;
        this.authenticated = false;
    }
    setOnRefreshToken(callback) {
        this.onRefreshTokenCallback = callback;
    }
    setOnRefreshTokenError(callback) {
        this.onRefreshTokenCallbackError = callback;
    }
    checkAuthorizations(session, authorizationName) {
        if (!authorizationName) {
            return;
        }
        const { authorizations, } = session;
        if (!authorizations.find(authorization => authorization.rules.find(rule => rule.name === authorizationName))) {
            throw new InvalidAuthorization(`No authorization '${authorizationName || ''}' found for your account.`);
        }
    }
    checkSubscription(session, minSubscriptionType) {
        const userSubscriptionType = session.profile?.subscriptionType || null;
        if (userSubscriptionType === null || userSubscriptionType <= minSubscriptionType) {
            const message = `Invalid subscription ${userSubscriptionType || 'n/a'}, required at least ${minSubscriptionType}`;
            throw new InvalidSubscription(message);
        }
    }
    setHost(host) {
        this.host = host;
        setCurrentServer(host);
    }
    setApiToken(token) {
        setApiToken(token);
    }
    setRefreshToken(refreshToken) {
        setRefreshToken(refreshToken);
    }
    setRefreshTenantId(refreshTenantId) {
        console.warn('Use of `setRefreshTenantId` is deprecated, use `setRefreshDomainName` instead.');
        setRefreshTenantId(refreshTenantId);
        getApiClient().setRefreshTenantId(refreshTenantId);
    }
    setRefreshDomainName(domainName) {
        setRefreshDomainName(domainName);
        getApiClient().setRefreshDomainName(domainName);
    }
    forceRefreshToken() {
        getApiClient().forceRefreshToken();
    }
    setIsMobile(mobile) {
        this.mobile = mobile;
    }
    getHost() {
        return this.host || undefined;
    }
    getSession() {
        return this.session || undefined;
    }
    getFirstName() {
        if (!this.session || !this.session.profile) {
            return '';
        }
        return this.session.profile.firstName;
    }
    getLastName() {
        if (!this.session || !this.session.profile) {
            return '';
        }
        return this.session.profile.lastName;
    }
    setClientId(clientId) {
        this.clientId = clientId;
        setApiClientId(this.clientId);
    }
    getName() {
        return `${this.getFirstName()} ${this.getLastName()}`;
    }
    async _onAuthenticated(rawSession) {
        if (this.authenticated && this.session) {
            return this.session;
        }
        const session = rawSession;
        if (!session) {
            return null;
        }
        setApiToken(session.token);
        if (session.refreshToken) {
            setRefreshToken(session.refreshToken);
        }
        try {
            const [profile, { wazo_version: engineVersion, }] = await Promise.all([getApiClient().confd.getUser(session.uuid), getApiClient().confd.getInfos()]);
            session.engineVersion = engineVersion;
            session.profile = profile;
            this.checkAuthorizations(session, this.authorizationName);
            if (this.minSubscriptionType !== null) {
                this.checkSubscription(session, +this.minSubscriptionType);
            }
        }
        catch (e) {
            // Destroy tokens when validation fails
            if (this.clientId) {
                await getApiClient().auth.deleteRefreshToken(this.clientId);
            }
            if (session) {
                await getApiClient().auth.logOut(session.token);
            }
            throw e;
        }
        try {
            const lineIds = session.profile?.lines.filter(line => !line.endpointSccp).map(line => String(line.id));
            const sipLines = await getApiClient().confd.getUserLinesSip(session.uuid, lineIds);
            session.profile.sipLines = sipLines.filter(line => line instanceof SipLine);
        }
        catch (e) { // When an user has only a sccp line, getSipLines return a 404
        }
        this.authenticated = true;
        Wazo.Websocket.open(this.host, session);
        this.session = session;
        return session;
    }
}
if (!global.wazoAuthInstance) {
    global.wazoAuthInstance = new Auth();
}
export default global.wazoAuthInstance;
