import ApiRequester from '../utils/api-requester';
import Agent from '../domain/Agent';
export interface AgentD {
    getAgent: (agentId: string) => Promise<Agent>;
    login: (agentNumber: string, context: string, extension: string) => Promise<boolean>;
    loginWithLineId: (lineId: number) => Promise<boolean>;
    logout: (agentNumber: string) => Promise<boolean>;
    pause: (agentNumber: string) => Promise<boolean>;
    resume: (agentNumber: string) => Promise<boolean>;
    getStatus: () => Promise<Agent>;
    staticLogout: () => Promise<boolean>;
    staticPause: () => Promise<boolean>;
    staticResume: () => Promise<boolean>;
}
declare const _default: (client: ApiRequester, baseUrl: string) => AgentD;
export default _default;
//# sourceMappingURL=agentd.d.ts.map