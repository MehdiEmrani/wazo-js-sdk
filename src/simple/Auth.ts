/* eslint-disable max-classes-per-file */
import Session from '../domain/Session';
import { BACKEND_LDAP_USER, DEFAULT_BACKEND_USER, DETAULT_EXPIRATION } from '../api/auth';
import getApiClient, { setCurrentServer, setApiToken, setRefreshToken, setApiClientId, setRefreshExpiration, setOnRefreshToken, setFetchOptions, setRefreshTenantId, setRefreshDomainName, setOnRefreshTokenError } from '../service/getApiClient';
import IssueReporter from '../service/IssueReporter';
import Wazo from './index';
import SipLine from '../domain/SipLine';

export class InvalidSubscription extends Error {}
export class InvalidAuthorization extends Error {}
export class NoTenantIdError extends Error {}
export class NoDomainNameError extends Error {}
const logger = IssueReporter.loggerFor('simple-auth');

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
  setRefreshToken: (refreshToken: string) => void ;
  setRefreshTenantId: (refreshTenantId: string) => void;
  setRefreshDomainName: (domainName: string) => void;
  forceRefreshToken: () => void;
  setIsMobile: (mobile: boolean) => void ;
  getHost: () => string | undefined;
  getSession: () => Session | undefined;
  getFirstName: () => string;
  getLastName: () => string;
  setClientId: (clientId: string) => void;
  getName: () => string ;
  _onAuthenticated: (rawSession: Session) => Promise<Session | null>;
}

class Auth implements IAuth {
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

  constructor() {
    this.expiration = DETAULT_EXPIRATION;
    this.authenticated = false;
    this.minSubscriptionType = null;
    this.BACKEND_WAZO = DEFAULT_BACKEND_USER;
    this.BACKEND_LDAP = BACKEND_LDAP_USER;
  }

  init(clientId: string, expiration: number, minSubscriptionType: number | null | undefined, authorizationName: string | null, mobile: boolean): void {
    this.clientId = clientId;
    this.expiration = expiration;
    this.minSubscriptionType = typeof minSubscriptionType === 'undefined' ? null : minSubscriptionType;
    this.authorizationName = authorizationName;
    this.host = null;
    this.session = null;
    this.mobile = mobile || false;
    setApiClientId(this.clientId);
    setRefreshExpiration(this.expiration);
    setOnRefreshToken((token: string, session: Session) => {
      logger.info('on refresh token done', {
        token,
      });
      setApiToken(token);
      Wazo.Websocket.updateToken(token);

      if (this.onRefreshTokenCallback) {
        this.onRefreshTokenCallback(token, session);
      }
    });
    setOnRefreshTokenError(error => {
      logger.error('on refresh token error', error);

      if (this.onRefreshTokenCallbackError) {
        this.onRefreshTokenCallbackError(error);
      }
    });
  }

  setFetchOptions(options: Record<string, any>) {
    setFetchOptions(options);
  }

  async logIn(username: string, password: string, backend?: string, extra?: string | Record<string, any>): Promise<Session | null> {
    let tenantId: string | null = null;
    let domainName = null;

    if (typeof extra === 'string') {
      tenantId = extra;
    }

    if (extra && typeof extra === 'object') {
      domainName = extra.domainName;
    }

    if (backend && backend !== this.BACKEND_WAZO && !tenantId && !domainName) {
      if (!tenantId) {
        throw new NoTenantIdError('No tenant id');
      }

      if (!domainName) {
        throw new NoDomainNameError('No domain name');
      }
    }

    this.authenticated = false;
    this.session = null;
    const rawSession = await getApiClient().auth.logIn({
      username,
      password,
      backend: backend as string,
      tenantId: tenantId as string,
      domainName: <unknown>domainName as string,
      expiration: this.expiration,
      mobile: this.mobile,
    });

    if (backend) {
      getApiClient().setRefreshBackend(backend);
    }

    if (tenantId) {
      getApiClient().setRefreshTenantId(tenantId);
    }

    if (domainName) {
      getApiClient().setRefreshDomainName(domainName);
    }

    return this._onAuthenticated(rawSession as Session);
  }

  async logInViaRefreshToken(refreshToken: string): Promise<Session | null> {
    const rawSession = await getApiClient().auth.refreshToken(refreshToken, '', this.expiration, this.mobile);
    return this._onAuthenticated(rawSession as Session);
  }

  async validateToken(token: string, refreshToken: string): Promise<Session | undefined | null> {
    if (!token) {
      return;
    }

    if (refreshToken) {
      setRefreshToken(refreshToken);
    }

    // Check if the token is valid
    try {
      const rawSession = await getApiClient().auth.authenticate(token);
      return this._onAuthenticated(rawSession as Session);
    } catch (e: any) {
      logger.error('on validate token error', e);
      console.warn(e);
    }
  }

  async generateNewToken(refreshToken: string): Promise<Session | null | undefined> {
    return getApiClient().auth.refreshToken(refreshToken, '', this.expiration);
  }

  async logout(deleteRefreshToken = true): Promise<void> {
    try {
      Wazo.Websocket.close(true);

      if (this.clientId && deleteRefreshToken) {
        await getApiClient().auth.deleteRefreshToken(this.clientId);
      }
    } catch (e: any) { // Nothing to
    }

    try {
      await getApiClient().auth.logOut(this.session?.token || '');
    } catch (e: any) { // Nothing to
    }

    setApiToken(null);
    setRefreshToken(null);
    this.session = null;
    this.authenticated = false;
  }

  setOnRefreshToken(callback: (...args: Array<any>) => any) {
    this.onRefreshTokenCallback = callback;
  }

  setOnRefreshTokenError(callback: (...args: Array<any>) => any) {
    this.onRefreshTokenCallbackError = callback;
  }

  checkAuthorizations(session: Session, authorizationName: string | null | undefined): void {
    if (!authorizationName) {
      return;
    }

    const {
      authorizations,
    } = session;

    if (!authorizations.find(authorization => authorization.rules.find(rule => rule.name === authorizationName))) {
      throw new InvalidAuthorization(`No authorization '${authorizationName || ''}' found for your account.`);
    }
  }

  checkSubscription(session: Session, minSubscriptionType: number): void {
    const userSubscriptionType = <number>session.profile?.subscriptionType || null;

    if (userSubscriptionType === null || userSubscriptionType <= minSubscriptionType) {
      const message = `Invalid subscription ${userSubscriptionType || 'n/a'}, required at least ${minSubscriptionType}`;
      throw new InvalidSubscription(message);
    }
  }

  setHost(host: string): void {
    this.host = host;
    setCurrentServer(host);
  }

  setApiToken(token: string): void {
    setApiToken(token);
  }

  setRefreshToken(refreshToken: string): void {
    setRefreshToken(refreshToken);
  }

  setRefreshTenantId(refreshTenantId: string): void {
    console.warn('Use of `setRefreshTenantId` is deprecated, use `setRefreshDomainName` instead.');
    setRefreshTenantId(refreshTenantId);
    getApiClient().setRefreshTenantId(refreshTenantId);
  }

  setRefreshDomainName(domainName: string): void {
    setRefreshDomainName(domainName);
    getApiClient().setRefreshDomainName(domainName);
  }

  forceRefreshToken(): void {
    getApiClient().forceRefreshToken();
  }

  setIsMobile(mobile: boolean): void {
    this.mobile = mobile;
  }

  getHost(): string | undefined {
    return this.host || undefined;
  }

  getSession(): Session | undefined {
    return this.session || undefined;
  }

  getFirstName(): string {
    if (!this.session || !this.session.profile) {
      return '';
    }

    return this.session.profile.firstName;
  }

  getLastName(): string {
    if (!this.session || !this.session.profile) {
      return '';
    }

    return this.session.profile.lastName;
  }

  setClientId(clientId: string): void {
    this.clientId = clientId;
    setApiClientId(this.clientId);
  }

  getName(): string {
    return `${this.getFirstName()} ${this.getLastName()}`;
  }

  async _onAuthenticated(rawSession: Session): Promise<Session | null> {
    if (this.authenticated && this.session) {
      return this.session;
    }

    const session = rawSession;

    if (!session) {
      return null;
    }

    setApiToken(session.token);

    if (session.refreshToken) {
      setRefreshToken(session.refreshToken);
    }

    try {
      const [profile, {
        wazo_version: engineVersion,
      }] = await Promise.all([getApiClient().confd.getUser(session.uuid as string), getApiClient().confd.getInfos()]);
      session.engineVersion = engineVersion;
      session.profile = profile;
      this.checkAuthorizations(session, this.authorizationName);

      if (this.minSubscriptionType !== null) {
        this.checkSubscription(session, +this.minSubscriptionType);
      }
    } catch (e: any) {
      // Destroy tokens when validation fails
      if (this.clientId) {
        await getApiClient().auth.deleteRefreshToken(this.clientId);
      }

      if (session) {
        await getApiClient().auth.logOut(session.token);
      }

      throw e;
    }

    try {
      const lineIds: string[] = session.profile?.lines.filter(line => !line.endpointSccp).map(line => String(line.id));
      const sipLines = await getApiClient().confd.getUserLinesSip(session.uuid as string, lineIds);

      session.profile.sipLines = sipLines.filter(line => line instanceof SipLine) as SipLine[];
    } catch (e: any) { // When an user has only a sccp line, getSipLines return a 404
    }

    this.authenticated = true;
    Wazo.Websocket.open(this.host as string, session);
    this.session = session;
    return session;
  }

}

if (!global.wazoAuthInstance) {
  global.wazoAuthInstance = new Auth();
}

export default global.wazoAuthInstance;
