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
exports.NoDomainNameError = exports.NoTenantIdError = exports.InvalidAuthorization = exports.InvalidSubscription = void 0;
const auth_1 = require("../api/auth");
const getApiClient_1 = __importStar(require("../service/getApiClient"));
const IssueReporter_1 = __importDefault(require("../service/IssueReporter"));
const index_1 = __importDefault(require("./index"));
const SipLine_1 = __importDefault(require("../domain/SipLine"));
class InvalidSubscription extends Error {
}
exports.InvalidSubscription = InvalidSubscription;
class InvalidAuthorization extends Error {
}
exports.InvalidAuthorization = InvalidAuthorization;
class NoTenantIdError extends Error {
}
exports.NoTenantIdError = NoTenantIdError;
class NoDomainNameError extends Error {
}
exports.NoDomainNameError = NoDomainNameError;
const logger = IssueReporter_1.default.loggerFor('simple-auth');
class Auth {
    constructor() {
        this.expiration = auth_1.DETAULT_EXPIRATION;
        this.authenticated = false;
        this.minSubscriptionType = null;
        this.BACKEND_WAZO = auth_1.DEFAULT_BACKEND_USER;
        this.BACKEND_LDAP = auth_1.BACKEND_LDAP_USER;
    }
    init(clientId, expiration, minSubscriptionType, authorizationName, mobile) {
        this.clientId = clientId;
        this.expiration = expiration;
        this.minSubscriptionType = typeof minSubscriptionType === 'undefined' ? null : minSubscriptionType;
        this.authorizationName = authorizationName;
        this.host = null;
        this.session = null;
        this.mobile = mobile || false;
        (0, getApiClient_1.setApiClientId)(this.clientId);
        (0, getApiClient_1.setRefreshExpiration)(this.expiration);
        (0, getApiClient_1.setOnRefreshToken)((token, session) => {
            logger.info('on refresh token done', {
                token,
            });
            (0, getApiClient_1.setApiToken)(token);
            index_1.default.Websocket.updateToken(token);
            if (this.onRefreshTokenCallback) {
                this.onRefreshTokenCallback(token, session);
            }
        });
        (0, getApiClient_1.setOnRefreshTokenError)(error => {
            logger.error('on refresh token error', error);
            if (this.onRefreshTokenCallbackError) {
                this.onRefreshTokenCallbackError(error);
            }
        });
    }
    setFetchOptions(options) {
        (0, getApiClient_1.setFetchOptions)(options);
    }
    logIn(username, password, backend, extra) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const rawSession = yield (0, getApiClient_1.default)().auth.logIn({
                username,
                password,
                backend: backend,
                tenantId: tenantId,
                domainName: domainName,
                expiration: this.expiration,
                mobile: this.mobile,
            });
            if (backend) {
                (0, getApiClient_1.default)().setRefreshBackend(backend);
            }
            if (tenantId) {
                (0, getApiClient_1.default)().setRefreshTenantId(tenantId);
            }
            if (domainName) {
                (0, getApiClient_1.default)().setRefreshDomainName(domainName);
            }
            return this._onAuthenticated(rawSession);
        });
    }
    logInViaRefreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawSession = yield (0, getApiClient_1.default)().auth.refreshToken(refreshToken, '', this.expiration, this.mobile);
            return this._onAuthenticated(rawSession);
        });
    }
    validateToken(token, refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token) {
                return;
            }
            if (refreshToken) {
                (0, getApiClient_1.setRefreshToken)(refreshToken);
            }
            // Check if the token is valid
            try {
                const rawSession = yield (0, getApiClient_1.default)().auth.authenticate(token);
                return this._onAuthenticated(rawSession);
            }
            catch (e) {
                logger.error('on validate token error', e);
                console.warn(e);
            }
        });
    }
    generateNewToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().auth.refreshToken(refreshToken, '', this.expiration);
        });
    }
    logout(deleteRefreshToken = true) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                index_1.default.Websocket.close(true);
                if (this.clientId && deleteRefreshToken) {
                    yield (0, getApiClient_1.default)().auth.deleteRefreshToken(this.clientId);
                }
            }
            catch (e) { // Nothing to
            }
            try {
                yield (0, getApiClient_1.default)().auth.logOut(((_a = this.session) === null || _a === void 0 ? void 0 : _a.token) || '');
            }
            catch (e) { // Nothing to
            }
            (0, getApiClient_1.setApiToken)(null);
            (0, getApiClient_1.setRefreshToken)(null);
            this.session = null;
            this.authenticated = false;
        });
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
        var _a;
        const userSubscriptionType = ((_a = session.profile) === null || _a === void 0 ? void 0 : _a.subscriptionType) || null;
        if (userSubscriptionType === null || userSubscriptionType <= minSubscriptionType) {
            const message = `Invalid subscription ${userSubscriptionType || 'n/a'}, required at least ${minSubscriptionType}`;
            throw new InvalidSubscription(message);
        }
    }
    setHost(host) {
        this.host = host;
        (0, getApiClient_1.setCurrentServer)(host);
    }
    setApiToken(token) {
        (0, getApiClient_1.setApiToken)(token);
    }
    setRefreshToken(refreshToken) {
        (0, getApiClient_1.setRefreshToken)(refreshToken);
    }
    setRefreshTenantId(refreshTenantId) {
        console.warn('Use of `setRefreshTenantId` is deprecated, use `setRefreshDomainName` instead.');
        (0, getApiClient_1.setRefreshTenantId)(refreshTenantId);
        (0, getApiClient_1.default)().setRefreshTenantId(refreshTenantId);
    }
    setRefreshDomainName(domainName) {
        (0, getApiClient_1.setRefreshDomainName)(domainName);
        (0, getApiClient_1.default)().setRefreshDomainName(domainName);
    }
    forceRefreshToken() {
        (0, getApiClient_1.default)().forceRefreshToken();
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
        (0, getApiClient_1.setApiClientId)(this.clientId);
    }
    getName() {
        return `${this.getFirstName()} ${this.getLastName()}`;
    }
    _onAuthenticated(rawSession) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.authenticated && this.session) {
                return this.session;
            }
            const session = rawSession;
            if (!session) {
                return null;
            }
            (0, getApiClient_1.setApiToken)(session.token);
            if (session.refreshToken) {
                (0, getApiClient_1.setRefreshToken)(session.refreshToken);
            }
            try {
                const [profile, { wazo_version: engineVersion, }] = yield Promise.all([(0, getApiClient_1.default)().confd.getUser(session.uuid), (0, getApiClient_1.default)().confd.getInfos()]);
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
                    yield (0, getApiClient_1.default)().auth.deleteRefreshToken(this.clientId);
                }
                if (session) {
                    yield (0, getApiClient_1.default)().auth.logOut(session.token);
                }
                throw e;
            }
            try {
                const lineIds = (_a = session.profile) === null || _a === void 0 ? void 0 : _a.lines.filter(line => !line.endpointSccp).map(line => String(line.id));
                const sipLines = yield (0, getApiClient_1.default)().confd.getUserLinesSip(session.uuid, lineIds);
                session.profile.sipLines = sipLines.filter(line => line instanceof SipLine_1.default);
            }
            catch (e) { // When an user has only a sccp line, getSipLines return a 404
            }
            this.authenticated = true;
            index_1.default.Websocket.open(this.host, session);
            this.session = session;
            return session;
        });
    }
}
if (!global.wazoAuthInstance) {
    global.wazoAuthInstance = new Auth();
}
exports.default = global.wazoAuthInstance;
