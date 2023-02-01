/// <reference types="@types/node" />
import EventEmitter from 'events';
import type { Logger } from 'sip.js/lib/core/log/logger';
import type { MediaStreamFactory } from 'sip.js/lib/platform/web/session-description-handler/media-stream-factory';
import type { SessionDescriptionHandlerConfiguration } from 'sip.js/lib/platform/web/session-description-handler/session-description-handler-configuration';
import { SessionDescriptionHandler } from 'sip.js/lib/platform/web/session-description-handler/session-description-handler';
import { SessionDescriptionHandlerOptions } from 'sip.js/lib/platform/web/session-description-handler/session-description-handler-options';
import { Inviter, Invitation } from 'sip.js/lib/api';
export declare const wazoMediaStreamFactory: (constraints: Record<string, any>) => Promise<MediaStream>;
declare class WazoSessionDescriptionHandler extends SessionDescriptionHandler {
    gatheredCandidates: Array<string | null | undefined>;
    eventEmitter: EventEmitter;
    isWeb: boolean;
    session: Inviter | Invitation;
    constructor(logger: Logger, mediaStreamFactory: MediaStreamFactory, sessionDescriptionHandlerConfiguration: SessionDescriptionHandlerConfiguration, isWeb: boolean, session: Inviter | Invitation);
    on(event: string, callback: (...args: Array<any>) => any): void;
    off(event: string, callback: (...args: Array<any>) => any): void;
    setRemoteSessionDescription(sessionDescription: RTCSessionDescriptionInit): Promise<void>;
    getDescription(options?: Record<string, any>, modifiers?: Array<(...args: Array<any>) => any>): Promise<any>;
    sendDtmf(tones: string, options?: {
        duration: number;
        interToneGap: number;
    }): boolean;
    close(): void;
    updateDirection(options?: SessionDescriptionHandlerOptions, isConference?: boolean, audioOnly?: boolean): Promise<void>;
    setLocalMediaStream(stream: MediaStream): Promise<void>;
    getLocalMediaStream(options: Record<string, any>): Promise<any>;
}
export default WazoSessionDescriptionHandler;
//# sourceMappingURL=WazoSessionDescriptionHandler.d.ts.map