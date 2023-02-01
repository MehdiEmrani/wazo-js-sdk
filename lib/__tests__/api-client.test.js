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
const js_base64_1 = require("js-base64");
const api_client_1 = __importDefault(require("../api-client"));
const ServerError_1 = __importDefault(require("../domain/ServerError"));
const BadResponse_1 = __importDefault(require("../domain/BadResponse"));
const Session_1 = __importDefault(require("../domain/Session"));
const mockedResponse = {
    data: {
        token: 1,
    },
};
const mockedNotFoundResponse = {
    message: 'No such user voicemail',
};
const mockedTextErrorPayload = {
    message: 'No such user voicemail',
};
const mockedJsonErrorPayload = {
    timestamp: 1537529588.789515,
    message: 'No such user voicemail',
    error_id: 'no-such-user-voicemail',
    details: {
        user_uuid: 'xxx-xxx-xxx-xxx-xxxx',
    },
};
const mockedTextError = {
    ok: false,
    text: () => Promise.resolve(mockedTextErrorPayload),
    status: 500,
    headers: {
        get: () => 'text/plain',
    },
};
const mockedJsonError = {
    ok: false,
    json: () => Promise.resolve(mockedJsonErrorPayload),
    status: 500,
    headers: {
        get: () => 'application/json',
    },
};
const mockedJson = {
    ok: true,
    json: () => Promise.resolve(mockedResponse),
    headers: {
        get: () => 'application/json',
    },
};
const mockedUnAuthorized = {
    text: () => Promise.resolve(mockedResponse),
    ok: false,
    status: 401,
    headers: {
        get: () => 'text/plain',
    },
};
const mockedNotFound = {
    json: () => Promise.resolve(mockedNotFoundResponse),
    ok: false,
    status: 404,
    headers: {
        get: () => 'application/json',
    },
};
const server = 'localhost';
const authVersion = '0.1';
const username = 'wazo';
const password = 'zowa';
jest.mock('node-fetch/lib/index', () => { });
const token = '1234';
const client = new api_client_1.default({
    server,
});
client.setToken(token);
describe('With correct API results', () => {
    beforeEach(() => {
        jest.resetModules();
        // @ts-expect-error
        global.fetch = jest.fn(() => Promise.resolve(mockedJson));
    });
    describe('logIn test', () => {
        it('should retrieve user token', () => __awaiter(void 0, void 0, void 0, function* () {
            const data = {
                backend: 'wazo_user',
                expiration: 3600,
            };
            const headers = {
                Authorization: `Basic ${js_base64_1.Base64.encode(`${username}:${password}`)}`,
                'Content-Type': 'application/json',
            };
            // @ts-expect-error
            const result = yield client.auth.logIn({
                username,
                password,
            });
            expect(result).toBeInstanceOf(Session_1.default);
            // @ts-expect-error
            expect(result.token).toBe(1);
            expect(global.fetch).toBeCalledWith(`https://${server}/api/auth/${authVersion}/token`, {
                method: 'post',
                body: JSON.stringify(data),
                headers,
                agent: null,
            });
        }));
    });
    describe('logOut test', () => {
        it('should delete the specified token', () => __awaiter(void 0, void 0, void 0, function* () {
            const oldToken = 123;
            // @ts-expect-error
            yield client.auth.logOut(oldToken);
            expect(global.fetch).toBeCalledWith(`https://${server}/api/auth/${authVersion}/token/${oldToken}`, {
                method: 'delete',
                body: null,
                headers: {},
                agent: null,
            });
        }));
    });
});
describe('With unAuthorized API results', () => {
    beforeEach(() => {
        jest.resetModules();
        // @ts-expect-error
        global.fetch = jest.fn(() => Promise.resolve(mockedUnAuthorized));
    });
    describe('checkLogin test', () => {
        it('should return false on 401 status', () => __awaiter(void 0, void 0, void 0, function* () {
            const tokenToCheck = '123';
            const result = yield client.auth.checkToken(tokenToCheck);
            expect(result).toBeFalsy();
            expect(global.fetch).toBeCalledWith(`https://${server}/api/auth/${authVersion}/token/${tokenToCheck}`, {
                method: 'head',
                body: null,
                headers: {},
                agent: null,
            });
        }));
    });
});
describe('With not found API results', () => {
    beforeEach(() => {
        jest.resetModules();
        // @ts-expect-error
        global.fetch = jest.fn(() => Promise.resolve(mockedNotFound));
    });
    describe('fetchVoicemail test', () => {
        it('should throw a BadResponse instance on 404 status', () => __awaiter(void 0, void 0, void 0, function* () {
            let error = null;
            try {
                yield client.calld.listVoicemails();
            }
            catch (e) {
                error = e;
            }
            expect(error).not.toBeNull();
            expect(error).toBeInstanceOf(BadResponse_1.default);
            expect(error.message).toBe(mockedNotFoundResponse.message);
            expect(error.status).toBe(404);
            expect(global.fetch).toBeCalledWith(`https://${server}/api/calld/1.0/users/me/voicemails`, {
                method: 'get',
                body: null,
                headers: {
                    'X-Auth-Token': token,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                agent: null,
            });
        }));
    });
});
describe('With erroneous text API results', () => {
    beforeEach(() => {
        jest.resetModules();
        // @ts-expect-error
        global.fetch = jest.fn(() => Promise.resolve(mockedTextError));
    });
    it('throw an exception when the response is >= 500', () => __awaiter(void 0, void 0, void 0, function* () {
        let error = null;
        try {
            // @ts-expect-error
            yield client.auth.logIn({
                username,
                password,
            });
        }
        catch (e) {
            error = e;
        }
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(ServerError_1.default);
        expect(error.message).toBe(mockedTextErrorPayload.message);
        expect(error.status).toBe(500);
    }));
});
describe('With erroneous json API results', () => {
    beforeEach(() => {
        jest.resetModules();
        // @ts-expect-error
        global.fetch = jest.fn(() => Promise.resolve(mockedJsonError));
    });
    it('throw an exception when the response is >= 500', () => __awaiter(void 0, void 0, void 0, function* () {
        let error = null;
        try {
            // @ts-expect-error
            yield client.auth.logIn({
                username,
                password,
            });
        }
        catch (e) {
            error = e;
        }
        expect(error).not.toBeNull();
        expect(error).toBeInstanceOf(ServerError_1.default);
        expect(error.message).toBe(mockedJsonErrorPayload.message);
        expect(error.timestamp).toBe(mockedJsonErrorPayload.timestamp);
        expect(error.status).toBe(500);
    }));
});
