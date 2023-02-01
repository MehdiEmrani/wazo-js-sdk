import ApiRequester from '../utils/api-requester';
import CallLog from '../domain/CallLog';
export interface CallLogD {
    search: (search: string, limit: number) => Promise<Array<CallLog>>;
    searchBy: (field: string, value: string, limit: number) => Promise<Array<CallLog>>;
    listCallLogs: (offset?: number, limit?: number) => Promise<Array<CallLog>>;
    listDistinctCallLogs: (offset: number, limit: number, distinct?: string) => Promise<Array<CallLog>>;
    listCallLogsFromDate: (from: Date, number: string) => Promise<Array<CallLog>>;
}
declare const _default: (client: ApiRequester, baseUrl: string) => CallLogD;
export default _default;
//# sourceMappingURL=call-logd.d.ts.map