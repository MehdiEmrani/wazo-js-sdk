"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* global MediaStream, RTCPeerConnection */
const webrtc_1 = require("../../utils/webrtc");
const timeoutDuration = 8000; // @see https://webrtchacks.com/symmetric-nat/
exports.default = {
    name: 'Symmetric NAT',
    check: () => new Promise((resolve, reject) => {
        if (typeof MediaStream === 'undefined') {
            return resolve('Skipped on node');
        }
        const candidates = {};
        const rawCandidates = [];
        let nbCandidates = 0;
        const pc = new RTCPeerConnection({
            iceServers: [{
                    urls: 'stun:stun.wazo.io:443',
                }, {
                    urls: 'stun:stun1.l.google.com:19302',
                }, {
                    urls: 'stun:stun2.l.google.com:19302',
                }],
        });
        let timeout;
        const onEnded = () => {
            clearTimeout(timeout);
            if (Object.keys(candidates).length === 0) {
                reject(new Error(`Timed out (${timeoutDuration}ms), ${nbCandidates} candidates : ${rawCandidates.join(', ')}`));
                return;
            }
            const ports = candidates[Object.keys(candidates)[0]];
            if (ports.length === 1) {
                resolve();
            }
            else {
                reject(new Error('Symmetric NAT detected, you should use a TURN server.'));
            }
        };
        timeout = setTimeout(onEnded, timeoutDuration);
        pc.createDataChannel('wazo-check-nat');
        pc.onicecandidate = e => {
            nbCandidates++;
            if (e.candidate) {
                rawCandidates.push(e.candidate.candidate);
            }
            if (e.candidate && e.candidate.candidate.indexOf('srflx') !== -1) {
                const cand = (0, webrtc_1.parseCandidate)(e.candidate.candidate);
                if (!candidates[cand.relatedPort])
                    candidates[cand.relatedPort] = [];
                candidates[cand.relatedPort].push(cand.port);
            }
            else if (!e.candidate) {
                onEnded();
            }
        };
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
    }),
};
