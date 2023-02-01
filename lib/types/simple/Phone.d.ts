import { Inviter, Invitation } from 'sip.js/lib/api';
import { OutgoingInviteRequest } from 'sip.js/lib/core';
import type SipLine from '../domain/SipLine';
import type Session from '../domain/Session';
import type CallSession from '../domain/CallSession';
import AdHocAPIConference from '../domain/AdHocAPIConference';
import WebRTCPhone from '../domain/Phone/WebRTCPhone';
import WazoWebRTCClient from '../web-rtc-client';
import { IEmitter } from '../utils/Emitter';
export interface IPhone extends IEmitter {
    client: WazoWebRTCClient;
    phone: WebRTCPhone | null | undefined;
    session: Session;
    sipLine: SipLine | null | undefined;
    SessionState: Record<string, any>;
    ON_USER_AGENT: string;
    ON_REGISTERED: string;
    ON_UNREGISTERED: string;
    ON_PROGRESS: string;
    ON_CALL_ACCEPTED: string;
    ON_CALL_ANSWERED: string;
    ON_CALL_INCOMING: string;
    ON_CALL_OUTGOING: string;
    ON_CALL_MUTED: string;
    ON_CALL_UNMUTED: string;
    ON_CALL_RESUMED: string;
    ON_CALL_HELD: string;
    ON_CALL_UNHELD: string;
    ON_CAMERA_DISABLED: string;
    ON_CAMERA_RESUMED: string;
    ON_CALL_CANCELED: string;
    ON_CALL_FAILED: string;
    ON_CALL_REJECTED: string;
    ON_CALL_ENDED: string;
    ON_CALL_ENDING: string;
    ON_MESSAGE: string;
    ON_REINVITE: string;
    ON_TRACK: string;
    ON_AUDIO_STREAM: string;
    ON_VIDEO_STREAM: string;
    ON_REMOVE_STREAM: string;
    ON_SHARE_SCREEN_STARTED: string;
    ON_SHARE_SCREEN_ENDING: string;
    ON_SHARE_SCREEN_ENDED: string;
    ON_TERMINATE_SOUND: string;
    ON_PLAY_RING_SOUND: string;
    ON_PLAY_INBOUND_CALL_SIGNAL_SOUND: string;
    ON_PLAY_HANGUP_SOUND: string;
    ON_PLAY_PROGRESS_SOUND: string;
    ON_VIDEO_INPUT_CHANGE: string;
    ON_CALL_ERROR: string;
    ON_MESSAGE_TRACK_UPDATED: string;
    ON_NETWORK_STATS: string;
    ON_CHAT: string;
    ON_SIGNAL: string;
    ON_DISCONNECTED: string;
    ON_EARLY_MEDIA: string;
    MESSAGE_TYPE_CHAT: string;
    MESSAGE_TYPE_SIGNAL: string;
    connect: (options: Record<string, any>, sipLine?: SipLine | null | undefined) => Promise<void>;
    connectWithCredentials: (server: string, sipLine: SipLine, displayName: string, rawOptions: Record<string, any>) => void;
    disconnect: () => Promise<void>;
    call: (extension: string, withCamera: boolean, rawSipLine: SipLine | null | undefined, audioOnly: boolean, conference: boolean) => Promise<CallSession | null | undefined>;
    hangup: (callSession: CallSession) => Promise<boolean>;
    startConference: (host: CallSession, otherCalls: CallSession[]) => Promise<AdHocAPIConference>;
    mute: (callSession: CallSession, withApi?: boolean) => void;
    unmute: (callSession: CallSession, withApi?: boolean) => void;
    muteViaAPI: (callSession: CallSession) => void;
    unmuteViaAPI: (callSession: CallSession) => void;
    hold: (callSession: CallSession) => Promise<void | OutgoingInviteRequest> | null | undefined;
    unhold: (callSession: CallSession) => Promise<MediaStream | void | null | undefined>;
    resume: (callSession: CallSession) => Promise<MediaStream | null | void>;
    reject: (callSession: CallSession) => Promise<void> | undefined;
    transfer: (callSession: CallSession, target: string) => void;
    atxfer: (callSession: CallSession) => Record<string, any> | null;
    reinvite: (callSession: CallSession, constraints: (Record<string, any> | null), conference: boolean) => Promise<OutgoingInviteRequest | void | null>;
    getStats: (callSession: CallSession) => Promise<RTCStatsReport | null | undefined>;
    startNetworkMonitoring: (callSession: CallSession, interval: number) => void;
    stopNetworkMonitoring: (callSession: CallSession) => void;
    getSipSessionId: (sipSession: Invitation | Inviter) => string | null | undefined;
    sendMessage: (body: string, sipSession?: Inviter | Invitation, contentType?: string) => void;
    sendChat: (content: string, sipSession?: Inviter | Invitation) => void;
    sendSignal: (content: any, sipSession?: Inviter | Invitation) => void;
    turnCameraOff: (callSession: CallSession) => void;
    turnCameraOn: (callSession: CallSession) => void;
    startScreenSharing: (constraints: Record<string, any>, callSession?: CallSession) => Promise<MediaStream | null>;
    stopScreenSharing: (callSession?: CallSession, restoreLocalStream?: boolean) => Promise<OutgoingInviteRequest | void>;
    sendDTMF: (tone: string, callSession: CallSession) => void;
    getLocalStream: (callSession: CallSession) => MediaStream | null | undefined;
    hasLocalVideo: (callSession: CallSession) => boolean;
    hasALocalVideoTrack: (callSession: CallSession) => boolean;
    getLocalMediaStream: (callSession: CallSession) => MediaStream | null | undefined;
    getLocalVideoStream: (callSession: CallSession) => MediaStream | null;
    getRemoteStream: (callSession: CallSession) => MediaStream | null;
    getRemoteVideoStream: (callSession: CallSession) => MediaStream | null;
    isVideoRemotelyHeld: (callSession: CallSession) => boolean;
    getRemoteStreamForCall: (callSession: CallSession) => MediaStream | null;
    getRemoteStreamsForCall: (callSession: CallSession) => MediaStream | null;
    getRemoteVideoStreamForCall: (callSession: CallSession) => MediaStream | null;
    getRemoteVideoStreamFromPc: (callSession: CallSession) => MediaStream | null;
    hasVideo: (callSession: CallSession) => boolean;
    hasAVideoTrack: (callSession: CallSession) => boolean;
    getCurrentSipSession: () => Invitation | Inviter | null;
    getPrimaryWebRtcLine: () => SipLine | null;
    getOutputDevice: () => string | null;
    getPrimaryLine: () => SipLine | null;
    getLineById: (lineId: string) => SipLine | null;
    getSipLines: () => SipLine[];
    hasSfu: () => boolean;
    checkSfu: () => void;
    _transferEvents: () => void;
}
declare const _default: any;
export default _default;
//# sourceMappingURL=Phone.d.ts.map