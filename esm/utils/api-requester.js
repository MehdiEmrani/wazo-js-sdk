/* eslint-disable @typescript-eslint/default-param-last */
/* global window */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import { Base64 } from 'js-base64';
import BadResponse from '../domain/BadResponse';
import ServerError from '../domain/ServerError';
import isMobile from './isMobile';
import IssueReporter from '../service/IssueReporter';
const methods = ['head', 'get', 'post', 'put', 'delete'];
const logger = IssueReporter ? IssueReporter.loggerFor('api') : console;
// Use a function here to be able to mock it in tests
export const realFetch = () => {
    if (typeof fetch !== 'undefined') {
        return fetch;
    }
    if (typeof document !== 'undefined' && window.fetch) {
        // Browser
        return window.fetch;
    }
    if (isMobile()) {
        // React native
        return fetch;
    }
    // nodejs
    // this package is disable for react-native in package.json because it requires nodejs modules
    // Used to trick the optimizer to avoid requiring `node-fetch/lib/index` directly
    // It causes to require it on browsers when delivered by a nodejs engine (cf: vitejs).
    try {
        return require(Math.random() >= 0 ? 'node-fetch/lib/index' : '');
    }
    catch (e) {
        return fetch;
    }
};
export default class ApiRequester {
    server;
    agent;
    clientId;
    token;
    tenant;
    fetchOptions;
    refreshTokenCallback;
    refreshTokenPromise;
    shouldLogErrors;
    head;
    get;
    post;
    put;
    delete;
    static successResponseParser(response) {
        return response.status === 204 || response.status === 201 || response.status === 200;
    }
    static defaultParser(response) {
        return response.json().then((data) => data);
    }
    static getQueryString(obj) {
        return Object.keys(obj).filter(key => obj[key]).map(key => `${key}=${encodeURIComponent(obj[key])}`).join('&');
    }
    static base64Encode(str) {
        return typeof btoa !== 'undefined' ? btoa(str) : Base64.encode(str);
    }
    // @see https://github.com/facebook/flow/issues/183#issuecomment-358607052
    constructor({ server, refreshTokenCallback, clientId, agent = null, token = null, fetchOptions, }) {
        this.server = server;
        this.agent = agent;
        this.clientId = clientId;
        this.refreshTokenCallback = refreshTokenCallback;
        this.refreshTokenPromise = null;
        this.fetchOptions = fetchOptions || {};
        if (token) {
            this.token = token;
        }
        this.shouldLogErrors = true;
        methods.forEach(method => {
            // @ts-ignore
            this[method] = function sugar(...args) {
                // Add method in arguments passed to `call`
                args.splice(1, 0, method);
                // @ts-ignore
                return this.call.call(this, ...args);
            };
        });
    }
    setTenant(tenant) {
        this.tenant = tenant;
    }
    setToken(token) {
        this.token = token;
    }
    setFetchOptions(options) {
        this.fetchOptions = options;
    }
    disableErrorLogging() {
        this.shouldLogErrors = false;
    }
    enableErrorLogging() {
        this.shouldLogErrors = true;
    }
    async call(path, method = 'get', body = null, headers = null, parse = ApiRequester.defaultParser, firstCall = true) {
        const url = this.computeUrl(method, path, body);
        const newHeaders = this.getHeaders(headers);
        let newBody = method === 'get' ? null : body;
        if (newBody && newHeaders['Content-Type'] === 'application/json') {
            newBody = JSON.stringify(newBody);
        }
        const isHead = method === 'head';
        const hasEmptyResponse = method === 'delete' || isHead;
        const newParse = hasEmptyResponse ? ApiRequester.successResponseParser : parse;
        const fetchOptions = { ...(this.fetchOptions || {}),
        };
        const extraHeaders = fetchOptions.headers || {};
        delete fetchOptions.headers;
        const options = {
            method,
            body: newBody,
            headers: { ...this.getHeaders(headers),
                ...extraHeaders,
            },
            agent: this.agent,
            ...fetchOptions,
        };
        if (this.refreshTokenPromise) {
            logger.info('A token is already refreshing, waiting ...', {
                url,
            });
            await this.refreshTokenPromise;
        }
        const start = new Date();
        return realFetch()(url, options).then((response) => {
            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.indexOf('application/json') !== -1;
            IssueReporter.logRequest(url, options, response, start);
            // Throw an error only if status >= 400
            if ((isHead && response.status >= 500) || (!isHead && response.status >= 400)) {
                const promise = isJson ? response.json() : response.text();
                const exceptionClass = response.status >= 500 ? ServerError : BadResponse;
                return promise.then(async (err) => {
                    // Check if the token is still valid
                    if (firstCall && this._checkTokenExpired(response, err)) {
                        logger.warn('token expired', {
                            error: err.reason,
                        });
                        // Replay the call after refreshing the token
                        return this._replayWithNewToken(err, path, method, body, headers, parse);
                    }
                    const error = typeof err === 'string' ? exceptionClass.fromText(err, response.status) : exceptionClass.fromResponse(err, response.status);
                    if (this.shouldLogErrors) {
                        logger.error('API error', error);
                    }
                    throw error;
                });
            }
            return newParse(response, isJson);
        }).catch((error) => {
            if (this.shouldLogErrors) {
                logger.error('Fetch failed', {
                    url,
                    options,
                    message: error.message,
                    stack: error.stack,
                });
            }
            throw error;
        });
    }
    _checkTokenExpired(response, err) {
        // Special case when authenticating form a token: we got a 404
        const isTokenNotFound = response.status === 404 && this._isTokenNotFound(err);
        return response.status === 401 || isTokenNotFound;
    }
    _isTokenNotFound(err) {
        return err && err.reason && err.reason[0] === 'No such token';
    }
    _replayWithNewToken(err, path, method, body = null, headers = null, parse) {
        const isTokenNotFound = this._isTokenNotFound(err);
        let newPath = path;
        logger.info('refreshing token', {
            inProgress: !!this.refreshTokenPromise,
        });
        this.refreshTokenPromise = this.refreshTokenPromise || this.refreshTokenCallback();
        return this.refreshTokenPromise?.then(() => {
            this.refreshTokenPromise = null;
            logger.info('token refreshed', {
                isTokenNotFound,
            });
            if (isTokenNotFound) {
                const pathParts = path.split('/');
                pathParts.pop();
                pathParts.push(this.token);
                newPath = pathParts.join('/');
            }
            return this.call(newPath, method, body, headers, parse, false);
        }).catch(e => {
            this.refreshTokenPromise = null;
            throw e;
        });
    }
    getHeaders(header) {
        if (header instanceof Object) {
            return header;
        }
        return {
            'X-Auth-Token': this.token,
            ...(this.tenant ? {
                'Wazo-Tenant': this.tenant,
            } : null),
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
    }
    computeUrl(method, path, body) {
        const url = `${this.baseUrl}/${path}`;
        return method === 'get' && body && Object.keys(body).length ? `${url}?${ApiRequester.getQueryString(body)}` : url;
    }
    get baseUrl() {
        return `https://${this.server}/api`;
    }
}
