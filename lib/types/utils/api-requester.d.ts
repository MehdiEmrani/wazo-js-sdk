import type { Token } from '../domain/types';
type ConstructorParams = {
    server: string;
    agent: Record<string, any> | null | undefined;
    clientId: string | null | undefined;
    refreshTokenCallback: (...args: Array<any>) => any;
    token?: string | null;
    fetchOptions: Record<string, any> | null | undefined;
};
export declare const realFetch: () => any;
export default class ApiRequester {
    server: string;
    agent: Record<string, any> | null | undefined;
    clientId: string | null | undefined;
    token: string;
    tenant: string | null | undefined;
    fetchOptions: Record<string, any>;
    refreshTokenCallback: (...args: Array<any>) => any;
    refreshTokenPromise: Promise<any> | null | undefined;
    shouldLogErrors: boolean;
    head: (...args: Array<any>) => any;
    get: (...args: Array<any>) => any;
    post: (...args: Array<any>) => any;
    put: (...args: Array<any>) => any;
    delete: (...args: Array<any>) => any;
    static successResponseParser(response: Record<string, any>): boolean;
    static defaultParser(response: Record<string, any>): any;
    static getQueryString(obj: Record<string, any>): string;
    static base64Encode(str: string): string;
    constructor({ server, refreshTokenCallback, clientId, agent, token, fetchOptions, }: ConstructorParams);
    setTenant(tenant: string | null | undefined): void;
    setToken(token: string): void;
    setFetchOptions(options: Record<string, any>): void;
    disableErrorLogging(): void;
    enableErrorLogging(): void;
    call(path: string, method?: string, body?: Record<string, any> | null | undefined, headers?: (string | null | undefined) | (Record<string, any> | null | undefined), parse?: (...args: Array<any>) => any, firstCall?: boolean): Promise<any>;
    _checkTokenExpired(response: Record<string, any>, err: Record<string, any>): any;
    _isTokenNotFound(err: Record<string, any>): any;
    _replayWithNewToken(err: Record<string, any>, path: string, method: string, body: Record<string, any> | null | undefined, headers: string | Record<string, any> | null | undefined, parse: ((...args: Array<any>) => any)): Promise<any> | undefined;
    getHeaders(header: (Token | null | undefined) | (Record<string, any> | null | undefined)): Record<string, any>;
    computeUrl(method: string, path: string, body: Record<string, any> | null | undefined): string;
    get baseUrl(): string;
}
export {};
//# sourceMappingURL=api-requester.d.ts.map