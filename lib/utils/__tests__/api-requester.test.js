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
const api_requester_1 = __importDefault(require("../api-requester"));
const server = 'localhost';
const path = 'auth';
const method = 'get';
const body = {
    a: 1,
};
const url = `https://${server}/api/${path}?a=1`;
const token = 'abc';
const newToken = 'newToken';
const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Auth-Token': token,
};
describe('Generating query string', () => {
    it('should generate a simple query string from an object', () => {
        expect(api_requester_1.default.getQueryString({
            a: 1,
            b: 'someString',
        })).toBe('a=1&b=someString');
        expect(api_requester_1.default.getQueryString({
            bool: true,
            b: 'booléen',
        })).toBe('bool=true&b=bool%C3%A9en');
        expect(api_requester_1.default.getQueryString({
            nope: undefined,
            b: 'yep',
        })).toBe('b=yep');
    });
});
describe('Computing fetch URL', () => {
    it('should add query string to URL in get method with body', () => {
        const client = new api_requester_1.default({
            server: 'localhost',
            agent: null,
            clientId: null,
            refreshTokenCallback: () => null,
            fetchOptions: null,
        });
        expect(client.computeUrl('get', 'auth', {
            a: 1,
        })).toBe('https://localhost/api/auth?a=1');
        expect(client.computeUrl('post', 'auth', {
            a: 1,
        })).toBe('https://localhost/api/auth');
        expect(client.computeUrl('get', 'auth', null)).toBe('https://localhost/api/auth');
        expect(client.computeUrl('get', 'auth', {})).toBe('https://localhost/api/auth');
    });
});
describe('Retrieving headers', () => {
    it('should send a tenant if exists', () => {
        const tenant = 'abc234';
        const requester = new api_requester_1.default({
            server,
            agent: null,
            clientId: null,
            refreshTokenCallback: () => null,
            fetchOptions: null,
        });
        requester.setTenant(tenant);
        expect(requester.getHeaders(null)['Wazo-Tenant']).toBe(tenant);
    });
    it('should not send a tenant if not present', () => {
        const requester = new api_requester_1.default({
            server,
            agent: null,
            clientId: null,
            refreshTokenCallback: () => null,
            fetchOptions: null,
        });
        expect(requester.getHeaders(null)).not.toHaveProperty('Wazo-Tenant');
    });
});
describe('Calling fetch', () => {
    it('should call fetch without body but query string in get method', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.mock('node-fetch/lib/index', () => { });
        // @ts-ignore
        global.fetch = jest.fn(() => Promise.resolve({
            json: () => Promise.resolve({}),
            headers: {
                get: () => '',
            },
        }));
        yield new api_requester_1.default({
            server,
            agent: null,
            clientId: null,
            refreshTokenCallback: () => null,
            fetchOptions: null,
        }).call(path, method, body, {});
        expect(global.fetch).toBeCalledWith(url, {
            method: 'get',
            body: null,
            headers: {},
            agent: null,
        });
    }));
});
describe('With a refresh token', () => {
    it('should retry the call with a new token', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.mock('node-fetch/lib/index', () => { });
        let calls = 0;
        // @ts-ignore
        global.fetch = jest.fn(() => {
            calls++;
            return Promise.resolve({
                headers: {
                    get: () => 'application/json',
                },
                status: calls === 1 ? 401 : 200,
                json: () => Promise.resolve({}),
            });
        });
        const requester = new api_requester_1.default({
            server,
            agent: null,
            clientId: null,
            refreshTokenCallback: () => null,
            fetchOptions: null,
        });
        requester.token = token;
        requester.refreshTokenCallback = () => {
            requester.token = newToken;
            return new Promise(resolve => resolve(null));
        };
        const updatedHeaders = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Auth-Token': newToken,
        };
        yield requester.call(path, method, body, null);
        expect(global.fetch).toHaveBeenNthCalledWith(1, url, {
            method: 'get',
            body: null,
            headers,
            agent: null,
        });
        expect(global.fetch).toHaveBeenNthCalledWith(2, url, {
            method: 'get',
            body: null,
            headers: updatedHeaders,
            agent: null,
        });
    }));
});
