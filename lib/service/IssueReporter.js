"use strict";
/* global window */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable prefer-destructuring, no-param-reassign, no-underscore-dangle */
const moment_1 = __importDefault(require("moment"));
const api_requester_1 = require("../utils/api-requester");
const isMobile_1 = __importDefault(require("../utils/isMobile"));
const TRACE = 'trace';
const DEBUG = 'debug';
const INFO = 'info';
const LOG = 'log';
const WARN = 'warn';
const ERROR = 'error';
const CONSOLE_METHODS = [INFO, LOG, WARN, ERROR];
const LOG_LEVELS = [TRACE, DEBUG, INFO, LOG, WARN, ERROR];
const CATEGORY_PREFIX = 'logger-category=';
const MAX_REMOTE_RETRY = 100;
const addLevelsTo = (instance, withMethods = false) => {
    instance.TRACE = TRACE;
    instance.DEBUG = DEBUG;
    instance.INFO = INFO;
    instance.LOG = LOG;
    instance.WARN = WARN;
    instance.ERROR = ERROR;
    if (withMethods) {
        instance.trace = (...args) => instance.apply(null, [TRACE, ...args]);
        instance.debug = (...args) => instance.apply(null, [DEBUG, ...args]);
        instance.info = (...args) => instance.apply(null, [INFO, ...args]);
        instance.log = (...args) => instance.apply(null, [LOG, ...args]);
        instance.warn = (...args) => instance.apply(null, [WARN, ...args]);
        instance.error = (...args) => instance.apply(null, [ERROR, ...args]);
    }
    return instance;
};
const safeStringify = (object) => {
    const result = '{"message": "Not parsable JSON"}';
    try {
        return JSON.stringify(object);
    }
    catch (e) { // Nothing to do
    }
    return result;
};
class IssueReporter {
    constructor() {
        addLevelsTo(this);
        this.oldConsoleMethods = null;
        this.enabled = false;
        this.remoteClientConfiguration = null;
        this.buffer = [];
        this.bufferTimeout = null;
        this._boundProcessBuffer = this._processBuffer.bind(this);
        this._boundParseLoggerBody = this._parseLoggerBody.bind(this);
        this._callback = null;
    }
    init() {
        this._catchConsole();
    }
    setCallback(cb) {
        this._callback = cb;
    }
    configureRemoteClient(configuration = {
        tag: 'wazo-sdk',
        host: null,
        port: null,
        level: null,
        extra: {},
    }) {
        this.remoteClientConfiguration = configuration;
    }
    enable() {
        if (!this.oldConsoleMethods) {
            this.init();
        }
        this.enabled = true;
    }
    disable() {
        this.enabled = false;
    }
    loggerFor(category) {
        const logger = (level, ...args) => {
            this.log.apply(this, [level, this._makeCategory(category), ...args]);
        };
        return addLevelsTo(logger, true);
    }
    removeSlashes(str) {
        return str.replace(/"/g, "'").replace(/\\/g, '');
    }
    log(level, ...args) {
        var _a, _b;
        if (!this.enabled) {
            return;
        }
        // Handle category label
        let category = null;
        let skipSendToRemote = false;
        let extra = {};
        if (args[0].indexOf(CATEGORY_PREFIX) === 0) {
            category = args[0].split('=')[1];
            // eslint-disable-next-line no-param-reassign
            args.splice(0, 1);
        }
        // Handle extra data as object for the last argument
        const lastArg = args[args.length - 1];
        if (lastArg && ((typeof lastArg === 'object' && Object.keys(lastArg).length) || lastArg instanceof Error)) {
            if (lastArg instanceof Error) {
                extra = {
                    errorMessage: lastArg.message,
                    errorStack: lastArg.stack,
                    errorType: lastArg.constructor.name,
                    // @ts-ignore
                    skipSendToRemote: lastArg.skipSendToRemote,
                };
            }
            else {
                extra = lastArg;
            }
            // eslint-disable-next-line no-param-reassign
            args.splice(1, 1);
        }
        if (extra.skipSendToRemote) {
            skipSendToRemote = true;
            delete extra.skipSendToRemote;
        }
        const date = (0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss.SSS');
        const message = args.join(', ');
        let consoleMessage = message;
        if (Object.keys(extra).length) {
            const parsedExtra = safeStringify(extra);
            consoleMessage = `${consoleMessage} (${parsedExtra})`;
        }
        if (category) {
            consoleMessage = `[${category}] ${consoleMessage}`;
        }
        // Log the message in the console anyway (but don't console.error on mobile)
        const consoleLevel = (0, isMobile_1.default)() && level === 'error' ? WARN : level;
        // eslint-disable-next-line
        const oldMethod = ((_a = this.oldConsoleMethods) === null || _a === void 0 ? void 0 : _a[consoleLevel]) || ((_b = this.oldConsoleMethods) === null || _b === void 0 ? void 0 : _b.log);
        oldMethod.apply(oldMethod, [date, consoleMessage]);
        if (this._callback) {
            this._callback(level, consoleMessage);
        }
        if (!skipSendToRemote) {
            this._sendToRemoteLogger(level, Object.assign({ date,
                message,
                category }, extra));
        }
    }
    logRequest(url, options, response, start) {
        if (!this.enabled) {
            return;
        }
        const { status, } = response;
        const duration = +(new Date()) - +start;
        let level = TRACE;
        if (status >= 400 && status < 500) {
            level = WARN;
        }
        else if (status >= 500) {
            level = ERROR;
        }
        this.log(level, this._makeCategory('http'), url, {
            status,
            body: this.removeSlashes(JSON.stringify(options.body)),
            method: options.method,
            headers: options.headers,
            duration,
        });
    }
    // Logs aren't stored anymore
    getLogs() {
        console.warn('IssueReporter\'s logs aren\'t stored anymore. Please use fluentd to store them');
        return [];
    }
    getParsedLogs() {
        console.warn('IssueReporter\'s logs aren\'t stored anymore. Please use fluentd to store them');
        return [];
    }
    getReport() {
        return this.getParsedLogs().join('\r\n');
    }
    _catchConsole() {
        this.oldConsoleMethods = {};
        CONSOLE_METHODS.forEach((methodName) => {
            if (this.oldConsoleMethods) {
                // @ts-ignore
                // eslint-disable-next-line
                this.oldConsoleMethods[methodName] = console[methodName];
            }
            const parent = typeof window !== 'undefined' ? window : global;
            parent.console[methodName] = (...args) => {
                // Store message
                try {
                    this.log(methodName, args.join(' '));
                    if (this.oldConsoleMethods) {
                        // Use old console method to log it normally
                        this.oldConsoleMethods[methodName].apply(null, args);
                    }
                }
                catch (e) { // Avoid circular structure issues
                }
            };
        });
    }
    _sendToRemoteLogger(level, payload = {}) {
        if (!this.remoteClientConfiguration) {
            return;
        }
        const { level: minLevel, bufferSize, } = this.remoteClientConfiguration;
        if (!minLevel || this._isLevelAbove(minLevel, level)) {
            return;
        }
        payload.level = level;
        if (bufferSize > 0) {
            return this._addToBuffer(payload);
        }
        this._sendDebugToGrafana(payload);
    }
    _parseLoggerBody(payload) {
        const { level, } = payload;
        const { maxMessageSize, extra, } = this.remoteClientConfiguration || {};
        delete payload.level;
        if (maxMessageSize && typeof payload.message === 'string' && payload.message.length > maxMessageSize) {
            payload.message = `${payload.message.substr(0, maxMessageSize)}...`;
        }
        return safeStringify(Object.assign(Object.assign({ level }, payload), extra));
    }
    _addToBuffer(payload) {
        // Reset buffer timer
        if (this.bufferTimeout) {
            clearTimeout(this.bufferTimeout);
            this.bufferTimeout = null;
        }
        this.buffer.push(payload);
        const { bufferSize, bufferTimeout, } = this.remoteClientConfiguration;
        if (this.buffer.length > bufferSize) {
            return this._processBuffer();
        }
        if (bufferTimeout > 0) {
            this.bufferTimeout = setTimeout(this._boundProcessBuffer, bufferTimeout);
        }
    }
    _processBuffer() {
        this._sendDebugToGrafana(this.buffer);
        this.buffer = [];
        if (this.bufferTimeout) {
            clearTimeout(this.bufferTimeout);
            this.bufferTimeout = null;
        }
    }
    _sendDebugToGrafana(payload, retry = 0) {
        if (!this.remoteClientConfiguration || retry >= MAX_REMOTE_RETRY) {
            return;
        }
        const { tag, host, port, } = this.remoteClientConfiguration;
        const isSecure = +port === 443;
        const url = `http${isSecure ? 's' : ''}://${host}${isSecure ? '' : `:${port}`}/${tag}`;
        const body = Array.isArray(payload) ? `[${payload.map(this._boundParseLoggerBody).join(',')}]` : this._parseLoggerBody(payload);
        (0, api_requester_1.realFetch)()(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body,
        }).catch((e) => {
            // @ts-ignore
            e.skipSendToRemote = true;
            this.log('error', this._makeCategory('grafana'), 'Sending log to grafana, error', e);
            setTimeout(() => {
                if (Array.isArray(payload)) {
                    payload = payload.map(message => this._writeRetryCount(message, retry + 1));
                }
                else if (payload && typeof payload === 'object') {
                    payload = this._writeRetryCount(payload, retry + 1);
                }
                this._sendDebugToGrafana(payload, retry + 1);
            }, 5000 + retry * 1000);
        });
    }
    _writeRetryCount(message, count) {
        if (message && typeof message === 'object') {
            message._retry = count;
        }
        return message;
    }
    _isLevelAbove(level1, level2) {
        const index1 = LOG_LEVELS.indexOf(level1);
        const index2 = LOG_LEVELS.indexOf(level2);
        if (index1 === -1 || index2 === -1) {
            return false;
        }
        return index1 > index2;
    }
    _makeCategory(category) {
        return `${CATEGORY_PREFIX}${category}`;
    }
}
exports.default = new IssueReporter();
