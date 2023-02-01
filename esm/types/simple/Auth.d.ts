import Session from '../domain/Session';
export declare class InvalidSubscription extends Error {
}
export declare class InvalidAuthorization extends Error {
}
export declare class NoTenantIdError extends Error {
}
export declare class NoDomainNameError extends Error {
}
export interface IAuth {
    clientId: string;
    expiration: number;
    minSubscriptionType: number | null;
    authorizationName: string | null;
    host: string | null;
    session: Session | null;
    onRefreshTokenCallback: ((...args: Array<any>) => any) | null;
    onRefreshTokenCallbackError: ((...args: Array<any>) => any) | null;
    authenticated: boolean;
    mobile: boolean;
    BACKEND_WAZO: string;
    BACKEND_LDAP: string;
    init: (clientId: string, expiration: number, minSubscriptionType: number | null | undefined, authorizationName: string | null, mobile: boolean) => void;
    setFetchOptions: (options: Record<string, any>) => void;
    logIn: (username: string, password: string, backend?: string, extra?: string | Record<string, any>) => Promise<Session | null>;
    logInViaRefreshToken: (refreshToken: string) => Promise<Session | null>;
    validateToken: (token: string, refreshToken: string) => Promise<Session | undefined | null>;
    generateNewToken: (refreshToken: string) => Promise<Session | null | undefined>;
    logout: (deleteRefreshToken?: boolean) => Promise<void>;
    setOnRefreshToken: (callback: (...args: Array<any>) => any) => void;
    setOnRefreshTokenError: (callback: (...args: Array<any>) => any) => void;
    checkAuthorizations: (session: Session, authorizationName: string | null | undefined) => void;
    checkSubscription: (session: Session, minSubscriptionType: number) => void;
    setHost: (host: string) => void;
    setApiToken: (token: string) => void;
    setRefreshToken: (refreshToken: string) => void;
    setRefreshTenantId: (refreshTenantId: string) => void;
    setRefreshDomainName: (domainName: string) => void;
    forceRefreshToken: () => void;
    setIsMobile: (mobile: boolean) => void;
    getHost: () => string | undefined;
    getSession: () => Session | undefined;
    getFirstName: () => string;
    getLastName: () => string;
    setClientId: (clientId: string) => void;
    getName: () => string;
    _onAuthenticated: (rawSession: Session) => Promise<Session | null>;
}
declare const _default: any;
export default _default;
//# sourceMappingURL=Auth.d.ts.map