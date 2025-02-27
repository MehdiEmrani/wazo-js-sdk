type TodoObject = object;
export type Token = string;
export type UUID = string;
export type DateString = string;
export type RequestError = {
    timestamp: number;
    message: string;
    resource: string;
    error_id: string;
    details: {
        uuid: string;
    };
};
export type LogoutResponse = {
    data: {
        message: string;
    };
};
export type User = {
    username: string;
    uuid: UUID;
    firstname: string;
    lastname: string;
    enabled: boolean;
    tenant_uuid: string;
    emails: Array<string>;
};
export type Tenant = {
    name: string;
    uuid: UUID;
    phone: string | null | undefined;
    contact: string | null | undefined;
    address: Array<{
        city: string | null | undefined;
        country: string | null | undefined;
        state: string | null | undefined;
        line_1: string | null | undefined;
        line_2: string | null | undefined;
        zip_code: string | null | undefined;
    }>;
    parent_uuid: UUID;
};
export type Group = TodoObject;
export type Policy = {
    acl_templates: Array<string>;
    acl: Array<string>;
    description: string | null | undefined;
    tenant_uuid: UUID;
    uuid: UUID;
    name: string;
};
export type ListTenantsResponse = {
    filtered: number;
    total: number;
    items: Array<Tenant>;
};
export type ListUsersResponse = {
    filtered: number;
    total: number;
    items: Array<User>;
};
export type ListGroupsResponse = {
    filtered: number;
    total: number;
    items: Array<Group>;
};
export type ListPoliciesResponse = {
    total: number;
    items: Array<Policy>;
};
export type AccessdGroup = TodoObject;
export type Link = {
    href: string;
    rel: string;
};
export type Line = {
    id: number;
    endpoint_sip: {
        id: number;
        username: string;
        links: Array<Link>;
    };
    endpoint_sccp: string | null | undefined;
    endpoint_custom: string | null | undefined;
    extensions: Array<{
        id: number;
        exten: string;
        context: string;
        links: Array<Link>;
    }>;
};
export type ConfdUser = {
    id: number;
    uuid: UUID;
    firstname: string;
    lastname: string;
    email: string;
    timezone: string | null | undefined;
    language: string | null | undefined;
    description: string | null | undefined;
    caller_id: string;
    outgoing_caller_id: string;
    mobile_phone_number: string;
    username: string | null | undefined;
    password: string | null | undefined;
    music_on_hold: boolean | null | undefined;
    preprocess_subroutine: string | null | undefined;
    call_transfer_enabled: boolean;
    dtmf_hangup_enabled: boolean;
    call_record_enabled: boolean;
    online_call_record_enabled: boolean;
    supervision_enabled: boolean;
    ring_seconds: number;
    simultaneous_calls: number;
    call_permission_password: string;
    subscription_type: number;
    created_at: DateString;
    enabled: boolean;
    tenant_uuid: UUID;
    links: Array<Link>;
    agent: string | null | undefined;
    cti_profile: string | null | undefined;
    call_permissions: Array<string>;
    fallbacks: {
        noanswer_destination: string | null | undefined;
        busy_destination: string | null | undefined;
        congestion_destination: string | null | undefined;
        fail_destination: string | null | undefined;
    };
    groups: Array<AccessdGroup>;
    incalls: Array<Record<string, any>>;
    lines: Array<Line>;
    forwards: {
        busy: {
            enable: boolean;
            destination: string | null | undefined;
        };
        noanswer: {
            enable: boolean;
            destination: string | null | undefined;
        };
        unconditional: {
            enable: boolean;
            destination: string | null | undefined;
        };
    };
    schedules: [];
    services: {
        dnd: {
            enabled: boolean;
        };
        incallfilter: {
            enabled: boolean;
        };
    };
    switchboards: Array<Record<string, any>>;
    voicemail: string | null | undefined;
    queues: Array<Record<string, any>>;
};
export type ListConfdUsersResponse = {
    total: number;
    items: Array<ConfdUser>;
};
export type Application = {
    uuid: UUID;
    tenant_uuid: UUID;
    name: string;
    destination: string;
    destination_options: {
        music_on_hold: string;
        type: string;
    };
    links: Array<Link>;
};
export type ListApplicationsResponse = {
    total: number;
    items: Array<Application>;
};
export type Node = {
    uuid: UUID;
    calls: Array<Record<string, any>>;
};
export type CallNode = TodoObject;
export type ListNodesResponse = {
    items: Array<Node>;
};
export type ListCallNodesResponse = {
    uuid: UUID;
    items: Array<CallNode>;
};
export type GetTenantResponse = TodoObject;
export type GetUserResponse = TodoObject;
export type WebRtcConfig = {
    id: number;
    host: string;
    line: {
        id: number;
        links: Array<Link>;
    };
    links: Array<Link>;
    options: Array<Array<string>>;
    secret: string;
    tenant_uuid: string;
    type: string;
    username: string;
};
export type CTITransfer = {
    'flow': string;
    'id': string;
    'initiator_call': string;
    'initiator_uuid': string;
    'recipient_call': string;
    'status': string;
    'transferred_call': string;
};
export {};
//# sourceMappingURL=types.d.ts.map