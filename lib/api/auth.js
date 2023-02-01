"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DETAULT_EXPIRATION = exports.BACKEND_LDAP_USER = exports.DEFAULT_BACKEND_USER = void 0;
const api_requester_1 = __importDefault(require("../utils/api-requester"));
const Session_1 = __importDefault(require("../domain/Session"));
exports.DEFAULT_BACKEND_USER = 'wazo_user';
exports.BACKEND_LDAP_USER = 'ldap_user';
exports.DETAULT_EXPIRATION = 3600;
exports.default = ((client, baseUrl) => ({
    checkToken: (token) => client.head(`${baseUrl}/token/${token}`, null, {}),
    authenticate: (token) => client.get(`${baseUrl}/token/${token}`, null, {}).then((response) => Session_1.default.parse(response)),
    logIn(params) {
        const body = {
            backend: params.backend || exports.DEFAULT_BACKEND_USER,
            expiration: params.expiration || exports.DETAULT_EXPIRATION,
        };
        const headers = {
            Authorization: `Basic ${api_requester_1.default.base64Encode(`${params.username}:${params.password}`)}`,
            'Content-Type': 'application/json',
        };
        if (client.clientId) {
            body.access_type = 'offline';
            body.client_id = client.clientId;
        }
        if (params.mobile) {
            headers['Wazo-Session-Type'] = 'mobile';
        }
        if (params.tenantId) {
            console.warn('Use of `tenantId` is deprecated when calling logIn() method, use `domainName` instead.');
            body.tenant_id = params.tenantId;
        }
        if (params.domainName) {
            body.domain_name = params.domainName;
        }
        return client.post(`${baseUrl}/token`, body, headers).then((response) => Session_1.default.parse(response));
    },
    logOut: (token) => client.delete(`${baseUrl}/token/${token}`, null, {}, api_requester_1.default.successResponseParser),
    refreshToken: (refreshToken, backend, expiration, isMobile, tenantId, domainName) => {
        const body = {
            backend: backend || exports.DEFAULT_BACKEND_USER,
            expiration: expiration || exports.DETAULT_EXPIRATION,
            refresh_token: refreshToken,
            client_id: client.clientId,
        };
        if (tenantId) {
            console.warn('Use of `tenantId` is deprecated when calling refreshToken() method, use `domainName` instead.');
            body.tenant_id = tenantId;
        }
        if (domainName) {
            body.domain_name = domainName;
        }
        const headers = Object.assign({ 'Content-Type': 'application/json' }, (isMobile ? {
            'Wazo-Session-Type': 'mobile',
        } : {}));
        return client.post(`${baseUrl}/token`, body, headers, api_requester_1.default.defaultParser, false).then(Session_1.default.parse);
    },
    deleteRefreshToken: (clientId) => client.delete(`${baseUrl}/users/me/tokens/${clientId}`, null, null, api_requester_1.default.successResponseParser),
    updatePassword: (userUuid, oldPassword, newPassword) => {
        const body = {
            new_password: newPassword,
            old_password: oldPassword,
        };
        return client.put(`${baseUrl}/users/${userUuid}/password`, body, null, api_requester_1.default.successResponseParser);
    },
    sendDeviceToken: (userUuid, deviceToken, apnsVoipToken, apnsNotificationToken) => {
        const body = {
            token: deviceToken,
        };
        if (apnsVoipToken) {
            // Should be called `voip_token`, but we can't changed it to be retro-compatible
            body.apns_token = apnsVoipToken;
            body.apns_voip_token = apnsVoipToken;
        }
        if (apnsNotificationToken) {
            body.apns_notification_token = apnsNotificationToken;
        }
        return client.post(`${baseUrl}/users/${userUuid}/external/mobile`, body);
    },
    getPushNotificationSenderId: (userUuid) => client.get(`${baseUrl}/users/${userUuid}/external/mobile/sender_id`, null).then((response) => response.sender_id),
    /**
     * `username` or `email` should be set.
     */
    sendResetPasswordEmail: ({ username, email, }) => {
        const body = {};
        if (username) {
            body.username = username;
        }
        if (email) {
            body.email = email;
        }
        return client.get(`${baseUrl}/users/password/reset`, body, {}, api_requester_1.default.successResponseParser);
    },
    resetPassword: (userUuid, password) => {
        const body = {
            password,
        };
        return client.post(`${baseUrl}/users/password/reset?user_uuid=${userUuid}`, body, null, api_requester_1.default.successResponseParser);
    },
    removeDeviceToken: (userUuid) => client.delete(`${baseUrl}/users/${userUuid}/external/mobile`),
    createUser: (username, password, firstname, lastname) => {
        const body = {
            username,
            password,
            firstname,
            lastname,
        };
        return client.post(`${baseUrl}/users`, body);
    },
    addUserEmail: (userUuid, email, main) => {
        const body = {
            emails: [{
                    address: email,
                    main,
                }],
        };
        return client.put(`${baseUrl}/users/${userUuid}/emails`, body);
    },
    addUserPolicy: (userUuid, policyUuid) => client.put(`${baseUrl}/users/${userUuid}/policies/${policyUuid}`),
    getRestrictionPolicies: (scopes) => client.post(`${baseUrl}/token/${client.token}/scopes/check`, {
        scopes,
    }),
    deleteUserPolicy: (userUuid, policyUuid) => client.delete(`${baseUrl}/users/${userUuid}/policies/${policyUuid}`),
    addUserGroup: (userUuid, groupUuid) => client.put(`${baseUrl}/groups/${groupUuid}/users/${userUuid}`),
    listUsersGroup: (groupUuid) => client.get(`${baseUrl}/groups/${groupUuid}/users`),
    deleteUserGroup: (userUuid, groupUuid) => client.delete(`${baseUrl}/groups/${groupUuid}/users/${userUuid}`),
    getUser: (userUuid) => client.get(`${baseUrl}/users/${userUuid}`),
    getUserSession: (userUuid) => client.get(`${baseUrl}/users/${userUuid}/sessions`),
    deleteUserSession: (userUuid, sessionUuids) => client.delete(`${baseUrl}/users/${userUuid}/sessions/${sessionUuids}`),
    listUsers: () => client.get(`${baseUrl}/users`),
    deleteUser: (userUuid) => client.delete(`${baseUrl}/users/${userUuid}`),
    listTenants: () => client.get(`${baseUrl}/tenants`),
    getTenant: (tenantUuid) => client.get(`${baseUrl}/tenants/${tenantUuid}`),
    createTenant: (name) => client.post(`${baseUrl}/tenants`, {
        name,
    }),
    updateTenant: (uuid, name, contact, phone, address) => {
        const body = {
            name,
            contact,
            phone,
            address,
        };
        return client.put(`${baseUrl}/tenants/${uuid}`, body);
    },
    deleteTenant: (uuid) => client.delete(`${baseUrl}/tenants/${uuid}`),
    createGroup: (name) => client.post(`${baseUrl}/groups`, {
        name,
    }),
    listGroups: () => client.get(`${baseUrl}/groups`),
    deleteGroup: (uuid) => client.delete(`${baseUrl}/groups/${uuid}`),
    createPolicy: (name, description, aclTemplates) => {
        const body = {
            name,
            description,
            acl_templates: aclTemplates,
            // deprecated
            acl: aclTemplates,
        };
        return client.post(`${baseUrl}/policies`, body);
    },
    listPolicies: () => client.get(`${baseUrl}/policies`),
    deletePolicy: (policyUuid) => client.delete(`${baseUrl}/policies/${policyUuid}`),
    getProviders: (userUuid) => client.get(`${baseUrl}/users/${userUuid}/external`),
    getProviderToken: (userUuid, provider) => client.get(`${baseUrl}/users/${userUuid}/external/${provider}`),
    getProviderAuthUrl: (userUuid, provider) => client.post(`${baseUrl}/users/${userUuid}/external/${provider}`, {}),
    deleteProviderToken: (userUuid, provider) => client.delete(`${baseUrl}/users/${userUuid}/external/${provider}`),
}));
