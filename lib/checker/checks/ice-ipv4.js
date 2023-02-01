"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* global MediaStream, RTCPeerConnection */
const webrtc_1 = require("../../utils/webrtc");
const isMobile_1 = __importDefault(require("../../utils/isMobile"));
const checkIsIPV4 = (ip) => {
    const blocks = ip.split('.');
    if (blocks.length !== 4) {
        return false;
    }
    return blocks.every(block => parseInt(block, 10) >= 0 && parseInt(block, 10) <= 255);
};
exports.default = {
    name: 'Non IP v4 ice',
    check: (server, session, externalAppConfig) => new Promise((resolve, reject) => {
        if (typeof MediaStream === 'undefined') {
            return resolve('Skipped on node');
        }
        const mobile = (0, isMobile_1.default)();
        const offerOptions = {
            offerToReceiveAudio: 1,
        };
        const ips = [];
        const config = {
            iceServers: [{
                    urls: 'stun:stun1.l.google.com:19302',
                }, {
                    urls: 'stun:stun2.l.google.com:19302',
                }],
        };
        let hasSrflxOrRelay = false;
        if (externalAppConfig && externalAppConfig.stun_servers) {
            config.iceServers = Object.assign(Object.assign({}, externalAppConfig.stun_servers.split(',').map((url) => ({
                urls: url,
            }))), config.iceServers);
        }
        if (externalAppConfig && externalAppConfig.turn_servers) {
            config.iceServers = [...JSON.parse(externalAppConfig.turn_servers), ...config.iceServers];
            // Force to use TURN when defined in config
            config.iceTransportPolicy = 'relay';
        }
        const pc = new RTCPeerConnection(config);
        pc.createDataChannel('wazo-check-ipv4');
        pc.onicecandidate = e => {
            if (e.candidate) {
                const rawCandidate = e.candidate.candidate;
                if (rawCandidate.indexOf('srflx') !== -1 || rawCandidate.indexOf('relay') !== -1) {
                    hasSrflxOrRelay = true;
                    const candidate = (0, webrtc_1.parseCandidate)(e.candidate.candidate);
                    ips.push(candidate.ip);
                }
            }
            else if (!e.candidate) {
                if (!hasSrflxOrRelay) {
                    return reject(new Error('No `srflx` or `relay` found in candidate. Please consider using a TURN server.'));
                }
                if (ips.every(checkIsIPV4)) {
                    // @ts-ignore
                    resolve();
                }
                else {
                    const nonIPV4 = ips.find(ip => !checkIsIPV4(ip));
                    reject(new Error(`Non IPv4 ice candidate found : ${nonIPV4}.`));
                }
            }
        };
        // @ts-ignore
        pc.createOffer(offerOptions).then(offer => pc.setLocalDescription(offer)).then(description => (mobile ? pc.createOffer(offerOptions) : description)).then(sessionDescription => (mobile ? pc.setLocalDescription(sessionDescription) : sessionDescription));
    }),
};
