import Call from '../domain/Call';
import getApiClient from './getApiClient';
export default class CallApi {
    static async fetchCallLogs(offset, limit) {
        return getApiClient().callLogd.listCallLogs(offset, limit);
    }
    static async fetchDistinctCallLogs(offset, limit, distinct = 'peer_exten') {
        return getApiClient().callLogd.listDistinctCallLogs(offset, limit, distinct);
    }
    static async fetchActiveCalls() {
        return getApiClient().calld.listCalls();
    }
    static async fetchCallLogsFromDate(from, number) {
        return getApiClient().callLogd.listCallLogsFromDate(from, number);
    }
    static async search(query, limit) {
        return getApiClient().callLogd.search(query, limit);
    }
    static async searchBy(field, value, limit) {
        return getApiClient().callLogd.searchBy(field, value, limit);
    }
    static async fetchSIP(session, line) {
        const lineToUse = line || session.primaryLine();
        return getApiClient().confd.getUserLineSip(session.uuid, lineToUse ? lineToUse.id : '');
    }
    static async cancelCall(callSession) {
        return getApiClient().calld.cancelCall(callSession.callId);
    }
    static async makeCall(callFromLine, extension, isMobile = false, callbackAllLines = false) {
        const lineId = callFromLine ? callFromLine.id : null;
        const response = await getApiClient().calld.makeCall(extension, isMobile, lineId, callbackAllLines);
        return Call.parse(response);
    }
    static async relocateCall(callId, line, contactIdentifier) {
        return getApiClient().calld.relocateCall(callId, 'line', line, contactIdentifier);
    }
    static async hold(callId) {
        return getApiClient().calld.hold(callId);
    }
    static async resume(callId) {
        return getApiClient().calld.resume(callId);
    }
    static async mute(callId) {
        return getApiClient().calld.mute(callId);
    }
    static async sendDTMF(callId, digits) {
        return getApiClient().calld.sendDTMF(callId, digits);
    }
    static async unmute(callId) {
        return getApiClient().calld.unmute(callId);
    }
    static async transferCall(callId, number, flow) {
        return getApiClient().calld.transferCall(callId, number, flow);
    }
    static async cancelCallTransfer(transferId) {
        return getApiClient().calld.cancelCallTransfer(transferId);
    }
    static async confirmCallTransfer(transferId) {
        return getApiClient().calld.confirmCallTransfer(transferId);
    }
}
