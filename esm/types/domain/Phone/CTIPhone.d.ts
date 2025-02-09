import Session from '../Session';
import Call from '../Call';
import Line from '../Line';
import CallSession from '../CallSession';
import type { Phone, AvailablePhoneOptions } from './Phone';
import Emitter from '../../utils/Emitter';
export declare const TRANSFER_FLOW_ATTENDED = "attended";
export declare const TRANSFER_FLOW_BLIND = "blind";
export default class CTIPhone extends Emitter implements Phone {
    session: Session;
    isMobile: boolean;
    callbackAllLines: boolean;
    currentCall: Call | null | undefined;
    constructor(session: Session, isMobile?: boolean, callbackAllLines?: boolean);
    getOptions(): AvailablePhoneOptions;
    hasAnActiveCall(): boolean;
    callCount(): 0 | 1;
    isWebRTC(): boolean;
    getUserAgent(): string;
    startHeartbeat(): void;
    setOnHeartbeatTimeout(): void;
    setOnHeartbeatCallback(): void;
    stopHeartbeat(): void;
    bindClientEvents(): void;
    onConnect(): void;
    onDisconnect(): void;
    makeCall(number: string, line: Line): Promise<CallSession | null | undefined>;
    accept(callSession: CallSession): Promise<string | null>;
    endCurrentCall(callSession: CallSession): void;
    hangup(callSession: CallSession): Promise<boolean>;
    ignore(): void;
    reject(callSession: CallSession): Promise<void>;
    transfer(callSession: CallSession, number: string): Promise<void>;
    indirectTransfer(): Promise<boolean>;
    initiateCTIIndirectTransfer(callSession: CallSession, number: string): Promise<any>;
    cancelCTIIndirectTransfer(transferId: string): Promise<any>;
    confirmCTIIndirectTransfer(transferId: string): Promise<any>;
    sendKey(callSession: CallSession, digits: string): void;
    onConnectionMade(): void;
    close(): Promise<void>;
    hold(callSession: CallSession): Promise<boolean>;
    resume(callSession: CallSession): Promise<boolean>;
    mute(callSession: CallSession): Promise<void>;
    unmute(callSession: CallSession): Promise<void>;
    putOnSpeaker(): void;
    putOffSpeaker(): void;
    turnCameraOff(): void;
    turnCameraOn(): void;
    changeAudioInputDevice(): Promise<null>;
    changeVideoInputDevice(): Promise<null>;
    changeAudioDevice(): void;
    changeRingDevice(): void;
    changeAudioVolume(): void;
    changeRingVolume(): void;
    hasVideo(): boolean;
    hasAVideoTrack(): boolean;
    getLocalStreamForCall(): MediaStream | null | undefined;
    getRemoteStreamForCall(): MediaStream | null | undefined;
    getLocalVideoStream(): MediaStream | null | undefined;
    setActiveSipSession(): void;
    isRegistered(): boolean;
    hasIncomingCallSession(): boolean;
    hasActiveRemoteVideoStream(): boolean;
    getCurrentCallSession(): CallSession | null | undefined;
    enableRinging(): void;
    sendMessage(): void;
    disableRinging(): void;
    getLocalStream(): null;
    getRemoteStream(): null;
    getRemoteVideoStream(): null;
    getRemoteAudioStream(): null;
    hasLocalVideo(): boolean;
    useLocalVideoElement(): void;
    setMediaConstraints(): void;
}
//# sourceMappingURL=CTIPhone.d.ts.map