type Extension = {
    context: string;
    exten: string;
    id: number;
    links?: Array<{
        href: string;
        rel: string;
    }>;
};
export type Endpoint = {
    id: number;
    links: Array<{
        href: string;
        rel: string;
    }>;
    username?: string;
};
export type LineResponse = {
    endpoint_custom: Endpoint | null | undefined;
    endpoint_sccp: Endpoint | null | undefined;
    endpoint_sip: Endpoint | null | undefined;
    extensions: Array<Extension>;
    id: number;
};
type LineArguments = {
    id?: number;
    extensions?: Array<Extension>;
    endpointCustom?: Endpoint | null;
    endpointSccp?: Endpoint | null;
    endpointSip?: Endpoint | null;
};
export default class Line {
    type: string;
    id: number | undefined;
    extensions: Array<Extension> | undefined;
    endpointCustom: Endpoint | null;
    endpointSccp: Endpoint | null;
    endpointSip: Endpoint | null;
    static parse(plain: LineResponse): Line;
    static newFrom(profile: Line): any;
    is(line: Line | null | undefined): boolean;
    hasExtension(extension: string): boolean;
    constructor({ id, extensions, endpointCustom, endpointSccp, endpointSip, }?: LineArguments);
}
export {};
//# sourceMappingURL=Line.d.ts.map