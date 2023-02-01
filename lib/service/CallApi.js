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
const Call_1 = __importDefault(require("../domain/Call"));
const getApiClient_1 = __importDefault(require("./getApiClient"));
class CallApi {
    static fetchCallLogs(offset, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().callLogd.listCallLogs(offset, limit);
        });
    }
    static fetchDistinctCallLogs(offset, limit, distinct = 'peer_exten') {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().callLogd.listDistinctCallLogs(offset, limit, distinct);
        });
    }
    static fetchActiveCalls() {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().calld.listCalls();
        });
    }
    static fetchCallLogsFromDate(from, number) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().callLogd.listCallLogsFromDate(from, number);
        });
    }
    static search(query, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().callLogd.search(query, limit);
        });
    }
    static searchBy(field, value, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().callLogd.searchBy(field, value, limit);
        });
    }
    static fetchSIP(session, line) {
        return __awaiter(this, void 0, void 0, function* () {
            const lineToUse = line || session.primaryLine();
            return (0, getApiClient_1.default)().confd.getUserLineSip(session.uuid, lineToUse ? lineToUse.id : '');
        });
    }
    static cancelCall(callSession) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().calld.cancelCall(callSession.callId);
        });
    }
    static makeCall(callFromLine, extension, isMobile = false, callbackAllLines = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const lineId = callFromLine ? callFromLine.id : null;
            const response = yield (0, getApiClient_1.default)().calld.makeCall(extension, isMobile, lineId, callbackAllLines);
            return Call_1.default.parse(response);
        });
    }
    static relocateCall(callId, line, contactIdentifier) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().calld.relocateCall(callId, 'line', line, contactIdentifier);
        });
    }
    static hold(callId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().calld.hold(callId);
        });
    }
    static resume(callId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().calld.resume(callId);
        });
    }
    static mute(callId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().calld.mute(callId);
        });
    }
    static sendDTMF(callId, digits) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().calld.sendDTMF(callId, digits);
        });
    }
    static unmute(callId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().calld.unmute(callId);
        });
    }
    static transferCall(callId, number, flow) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().calld.transferCall(callId, number, flow);
        });
    }
    static cancelCallTransfer(transferId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().calld.cancelCallTransfer(transferId);
        });
    }
    static confirmCallTransfer(transferId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, getApiClient_1.default)().calld.confirmCallTransfer(transferId);
        });
    }
}
exports.default = CallApi;
