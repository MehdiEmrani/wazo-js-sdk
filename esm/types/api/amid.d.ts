import ApiRequester from '../utils/api-requester';
export interface AmiD {
    action: (action: string, args: Record<string, any>) => Promise<string>;
    getAors: (endpoint: string) => Promise<any[]>;
}
declare const _default: (client: ApiRequester, baseUrl: string) => AmiD;
export default _default;
//# sourceMappingURL=amid.d.ts.map