import type { Endpoint } from './Line';
type SipLineResponse = {
    id: number;
    uuid: string;
    tenant_uuid: string;
    username: string;
    secret: string;
    type: string;
    host: string;
    options: string[][] | null | undefined;
    auth_section_options: string[][] | null | undefined;
    endpoint_section_options: string[][] | null | undefined;
    links: Array<Record<string, any>>;
    trunk: string | null | undefined;
    line: Endpoint;
};
type SipLineArguments = {
    id: number;
    uuid: string;
    tenantUuid: string;
    username: string;
    secret: string;
    type: string;
    host: string;
    options: string[][] | null | undefined;
    endpointSectionOptions: string[][] | null | undefined;
    links: Array<Record<string, any>>;
    trunk: string | null | undefined;
    line: Endpoint;
};
export default class SipLine {
    id: any;
    uuid: string;
    tenantUuid: string;
    username: string;
    secret: string;
    type: string;
    host: string;
    options: string[][] | null | undefined;
    endpointSectionOptions: string[][] | null | undefined;
    links: Array<Record<string, any>>;
    trunk: string | null | undefined;
    line: Endpoint;
    static parse(plain: SipLineResponse): SipLine;
    static newFrom(sipLine: SipLine): any;
    is(line: SipLine): boolean;
    getOptions(): Array<Record<string, any>>;
    isWebRtc(): boolean;
    hasVideo(): any;
    hasVideoConference(): boolean;
    constructor({ id, uuid, tenantUuid, username, secret, type, host, options, endpointSectionOptions, links, trunk, line, }: SipLineArguments);
}
export {};
//# sourceMappingURL=SipLine.d.ts.map