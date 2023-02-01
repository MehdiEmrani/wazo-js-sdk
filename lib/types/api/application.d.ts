import ApiRequester from '../utils/api-requester';
import type { ListNodesResponse, ListCallNodesResponse } from '../domain/types';
export interface ApplicationD {
    bridgeCall: (applicationUuid: string, callId: number, context: string, exten: string, autoanswer: string, displayed_caller_id_number: string | null | undefined) => Promise<boolean>;
    answerCall: (applicationUuid: string, callId: number) => Promise<boolean>;
    calls: (applicationUuid: string) => Promise<boolean>;
    hangupCall: (applicationUuid: string, callId: number) => Promise<boolean>;
    startPlaybackCall: (applicationUuid: string, callId: number, language: string, uri: string) => Promise<boolean>;
    stopPlaybackCall: (applicationUuid: string, playbackUuid: string) => Promise<boolean>;
    startProgressCall: (applicationUuid: string, callId: number) => Promise<boolean>;
    stopProgressCall: (applicationUuid: string, callId: number) => Promise<boolean>;
    startMohCall: (applicationUuid: string, callId: number, mohUuid: string) => Promise<boolean>;
    stopMohCall: (applicationUuid: string, callId: number) => Promise<boolean>;
    startHoldCall: (applicationUuid: string, callId: number) => Promise<boolean>;
    stopHoldCall: (applicationUuid: string, callId: number) => Promise<boolean>;
    startMuteCall: (applicationUuid: string, callId: number) => Promise<boolean>;
    stopMuteCall: (applicationUuid: string, callId: number) => Promise<boolean>;
    sendDTMFCall: (applicationUuid: string, callId: number, digits: number) => Promise<boolean>;
    addCallNodes: (applicationUuid: string, nodeUuid: string, callId: string) => Promise<boolean>;
    createNewNodeWithCall: (applicationUuid: string, calls: Array<Record<string, any>>) => Promise<boolean>;
    addNewCallNodes: (applicationUuid: string, nodeUuid: string, context: string, exten: string, autoanswer: string) => Promise<boolean>;
    listCallsNodes: (applicationUuid: string, nodeUuid: string) => Promise<ListCallNodesResponse>;
    listNodes: (applicationUuid: string) => Promise<ListNodesResponse>;
    removeNode: (applicationUuid: string, nodeUuid: string) => Promise<boolean>;
    removeCallNodes: (applicationUuid: string, nodeUuid: string, callId: string) => Promise<boolean>;
    listSnoop: (applicationUuid: string) => Promise<ListNodesResponse>;
    removeSnoop: (applicationUuid: string, snoopUuid: string) => Promise<boolean>;
    viewSnoop: (applicationUuid: string, snoopUuid: string) => Promise<ListNodesResponse>;
    createSnoop: (applicationUuid: string, callId: number, snoopingCallId: number, whisperMode: string) => Promise<boolean>;
    updateSnoop: (applicationUuid: string, snoopUuid: string, whisperMode: string) => Promise<boolean>;
}
declare const _default: (client: ApiRequester, baseUrl: string) => ApplicationD;
export default _default;
//# sourceMappingURL=application.d.ts.map