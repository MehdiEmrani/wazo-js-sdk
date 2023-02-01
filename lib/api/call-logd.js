"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CallLog_1 = __importDefault(require("../domain/CallLog"));
exports.default = ((client, baseUrl) => ({
    search: (search, limit = 5) => client.get(`${baseUrl}/users/me/cdr`, {
        search,
        limit,
    }).then(CallLog_1.default.parseMany),
    searchBy: (field, value, limit = 5) => client.get(`${baseUrl}/users/me/cdr`, {
        [field]: value,
        limit,
    }).then(CallLog_1.default.parseMany),
    listCallLogs: (offset, limit = 5) => client.get(`${baseUrl}/users/me/cdr`, {
        offset,
        limit,
    }).then(CallLog_1.default.parseMany),
    listDistinctCallLogs: (offset, limit = 5, distinct = undefined) => client.get(`${baseUrl}/users/me/cdr`, {
        offset,
        limit,
        distinct,
    }).then(CallLog_1.default.parseMany),
    listCallLogsFromDate: (from, number) => client.get(`${baseUrl}/users/me/cdr`, {
        from: from.toISOString(),
        number,
    }).then(CallLog_1.default.parseMany),
}));
