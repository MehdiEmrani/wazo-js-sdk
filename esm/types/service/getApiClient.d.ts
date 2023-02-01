import WazoApiClient from '../api-client';
export declare const setApiClientId: (clientId: string, forServer?: string | null | undefined) => void;
export declare const setCurrentServer: (newServer: string) => void;
export declare const setApiToken: (newToken: string | null | undefined, forServer?: string | null | undefined) => void;
export declare const setRefreshToken: (newRefreshToken: string | null | undefined, forServer?: string | null | undefined) => void;
export declare const setRefreshTenantId: (refreshTenantId: string | null | undefined, forServer?: string | null | undefined) => void;
export declare const setRefreshDomainName: (refreshDomainName: string | null | undefined, forServer?: string | null | undefined) => void;
export declare const setOnRefreshToken: (onRefreshToken: (...args: Array<any>) => any, forServer?: string | null | undefined) => void;
export declare const setOnRefreshTokenError: (callback: (...args: Array<any>) => any, forServer?: string | null | undefined) => void;
export declare const setRefreshExpiration: (refreshExpiration: number, forServer?: string | null | undefined) => void;
export declare const setRefreshBackend: (refreshBackend: number, forServer?: string | null | undefined) => void;
export declare const setIsMobile: (isMobile: boolean, forServer?: string | null | undefined) => void;
export declare const setFetchOptions: (fetchOptions: Record<string, any>, forServer?: string | null | undefined) => void;
declare const _default: (forServer?: string | null | undefined) => WazoApiClient;
export default _default;
//# sourceMappingURL=getApiClient.d.ts.map