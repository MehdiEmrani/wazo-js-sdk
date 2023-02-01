export type AgentResponse = {
    context: string;
    extension: string;
    id: number;
    logged: boolean;
    number: string;
    paused: boolean;
    paused_reason: string;
};
type AgentArguments = {
    context: string;
    extension: string;
    id: number;
    logged: boolean;
    number: string;
    paused: boolean;
    pausedReason: string;
};
declare class Agent {
    context: string;
    extension: string;
    id: number;
    logged: boolean;
    number: string;
    paused: boolean;
    pausedReason: string;
    static parse(plain: AgentResponse): Agent;
    constructor({ context, extension, id, logged, number, paused, pausedReason, }: AgentArguments);
}
export default Agent;
//# sourceMappingURL=Agent.d.ts.map