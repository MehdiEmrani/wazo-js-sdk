"use strict";
/* eslint-disable no-underscore-dangle */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-useless-escape */
/* eslint-disable no-console */
const IssueReporter_1 = __importDefault(require("../IssueReporter"));
const api_requester_1 = require("../../utils/api-requester");
jest.mock('../../utils/api-requester');
let oldLog;
let oldError;
class MyError extends Error {
}
describe('IssueReporter', () => {
    beforeAll(() => {
        oldLog = console.log;
        oldError = console.error;
        console.log = () => { };
        console.error = () => { };
        IssueReporter_1.default.enable();
    });
    beforeEach(() => {
        jest.resetAllMocks();
        // @ts-expect-error
        api_requester_1.realFetch.mockImplementation(() => () => ({
            catch: () => { },
        }));
    });
    afterAll(() => {
        console.log = oldLog;
        console.error = oldError;
    });
    it('should compute level order', () => {
        expect(IssueReporter_1.default._isLevelAbove('info', 'trace')).toBeTruthy();
        expect(IssueReporter_1.default._isLevelAbove('trace', 'warn')).toBeFalsy();
        expect(IssueReporter_1.default._isLevelAbove('error', 'warn')).toBeTruthy();
        expect(IssueReporter_1.default._isLevelAbove('info', 'warn')).toBeFalsy();
        expect(IssueReporter_1.default._isLevelAbove('trace', 'trace')).toBeFalsy();
        expect(IssueReporter_1.default._isLevelAbove('trace', 'something')).toBeFalsy();
        expect(IssueReporter_1.default._isLevelAbove('something', 'trace')).toBeFalsy();
    });
    it('should send if verbosity is higher than required', () => {
        // Same level
        IssueReporter_1.default.configureRemoteClient({
            level: 'trace',
        });
        IssueReporter_1.default._sendToRemoteLogger('info');
        expect(api_requester_1.realFetch).toHaveBeenCalled();
    });
    it('should send if verbosity is equal than required', () => {
        // Same level
        IssueReporter_1.default.configureRemoteClient({
            level: 'trace',
        });
        IssueReporter_1.default._sendToRemoteLogger('trace');
        expect(api_requester_1.realFetch).toHaveBeenCalled();
    });
    it('should not send if verbosity is lower than required', () => {
        // Lower level
        IssueReporter_1.default.configureRemoteClient({
            level: 'info',
        });
        IssueReporter_1.default._sendToRemoteLogger('trace');
        expect(api_requester_1.realFetch).not.toHaveBeenCalled();
    });
    it('should log extra data', () => {
        jest.spyOn(IssueReporter_1.default, '_sendToRemoteLogger').mockImplementation(() => { });
        IssueReporter_1.default.log('log', 'logger-category=http', 'my message', {
            status: 200,
        });
        expect(IssueReporter_1.default._sendToRemoteLogger).toHaveBeenCalledWith('log', {
            date: expect.anything(),
            message: 'my message',
            category: 'http',
            status: 200,
        });
    });
    it('should log an error', () => {
        jest.spyOn(IssueReporter_1.default, '_sendToRemoteLogger').mockImplementation(() => { });
        IssueReporter_1.default.log('error', 'logger-category=http', 'my message', new MyError('nope'));
        expect(IssueReporter_1.default._sendToRemoteLogger).toHaveBeenCalledWith('error', {
            date: expect.anything(),
            message: 'my message',
            category: 'http',
            errorMessage: 'nope',
            errorStack: expect.anything(),
            errorType: 'MyError',
        });
    });
    it('remove slashes', () => {
        expect(IssueReporter_1.default.removeSlashes('\\')).toBe('');
        expect(IssueReporter_1.default.removeSlashes('\\"')).toBe("'");
        expect(IssueReporter_1.default.removeSlashes('\"')).toBe("'");
        expect(IssueReporter_1.default.removeSlashes('\\\"')).toBe("'");
    });
    it('Add retry count', () => {
        expect(IssueReporter_1.default._writeRetryCount('', 1)).toBe('');
        expect(IssueReporter_1.default._writeRetryCount('{}', 1)).toBe('{}');
        expect(IssueReporter_1.default._writeRetryCount({}, 1)).toEqual({
            _retry: 1,
        });
    });
});
