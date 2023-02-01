"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addIcesInAllBundles = exports.fixSdp = exports.hasAnActiveVideo = exports.activateVideoModifier = exports.deactivateVideoModifier = exports.getVideoDirection = exports.toggleVideoDirection = exports.fixBundle = exports.isSdpValid = exports.areCandidateValid = exports.parseCandidate = exports.getCandidates = void 0;
const sdp_transform_1 = __importDefault(require("sdp-transform"));
const getCandidates = (rawSdp) => {
    if (!rawSdp) {
        return [];
    }
    const sdp = sdp_transform_1.default.parse(rawSdp);
    if (!sdp || !sdp.media) {
        return [];
    }
    return sdp.media.map((media) => media.candidates).flat().filter((candidate) => !!candidate);
};
exports.getCandidates = getCandidates;
const parseCandidate = (candidate) => {
    if (!candidate) {
        return null;
    }
    const result = sdp_transform_1.default.parse(candidate.indexOf('a=') === 0 ? candidate : `a=${candidate}`);
    return result.candidates ? result.candidates[0] : null;
};
exports.parseCandidate = parseCandidate;
const getSrflxOrRelay = (candidates) => candidates.filter(candidate => candidate && (candidate.type === 'srflx' || candidate.type === 'relay'));
const areCandidateValid = (candidates) => getSrflxOrRelay(candidates).length > 0;
exports.areCandidateValid = areCandidateValid;
const isSdpValid = (sdp) => {
    const candidates = (0, exports.getCandidates)(sdp);
    return (0, exports.areCandidateValid)(candidates);
};
exports.isSdpValid = isSdpValid;
const fixBundle = (sdp) => {
    const parsedSdp = sdp_transform_1.default.parse(sdp);
    const bundleIndex = parsedSdp.groups.findIndex((group) => group.type === 'BUNDLE');
    if (bundleIndex !== -1) {
        parsedSdp.groups[bundleIndex].mids = parsedSdp.media.map((media, index) => ('mid' in media ? media.mid : index)).join(' ');
    }
    return sdp_transform_1.default.write(parsedSdp);
};
exports.fixBundle = fixBundle;
const toggleVideoDirection = (sdp, direction) => {
    const parsedSdp = sdp_transform_1.default.parse(sdp);
    parsedSdp.media = parsedSdp.media.map((media) => (Object.assign(Object.assign({}, media), (media.type === 'video' ? {
        direction,
    } : {}))));
    return sdp_transform_1.default.write(parsedSdp);
};
exports.toggleVideoDirection = toggleVideoDirection;
const getVideoDirection = (sdp) => {
    const parsedSdp = sdp_transform_1.default.parse(sdp);
    const videoMedia = parsedSdp.media.find(media => media.type === 'video');
    if (!videoMedia) {
        return null;
    }
    return videoMedia.direction;
};
exports.getVideoDirection = getVideoDirection;
const deactivateVideoModifier = (rawDescription) => {
    const description = rawDescription;
    description.sdp = (0, exports.toggleVideoDirection)(description.sdp, 'inactive');
    return Promise.resolve(description);
};
exports.deactivateVideoModifier = deactivateVideoModifier;
const activateVideoModifier = (rawDescription) => {
    const description = rawDescription;
    description.sdp = (0, exports.toggleVideoDirection)(description.sdp, 'sendrecv');
    return Promise.resolve(description);
};
exports.activateVideoModifier = activateVideoModifier;
const hasAnActiveVideo = (sdp) => {
    if (!sdp) {
        return false;
    }
    const parsedSdp = sdp_transform_1.default.parse(sdp);
    return !!parsedSdp.media.find(media => media.type === 'video' && media.port > 10 && (!media.direction || media.direction !== 'inactive'));
};
exports.hasAnActiveVideo = hasAnActiveVideo;
const fixSdp = (sdp, candidates, forcePort = true) => {
    const parsedSdp = sdp_transform_1.default.parse(sdp);
    const mainCandidate = getSrflxOrRelay(candidates)[0];
    const ip = mainCandidate ? mainCandidate.ip : null;
    if (ip) {
        parsedSdp.origin.address = ip;
    }
    parsedSdp.media = parsedSdp.media.map((media) => {
        const port = forcePort ? mainCandidate ? mainCandidate.port : media.port : media.port;
        return Object.assign(Object.assign({}, media), { port, candidates: (media.candidates || []).concat(candidates), direction: port < 10 ? 'inactive' : media.direction });
    });
    let fixed = sdp_transform_1.default.write(parsedSdp);
    if (ip) {
        fixed = fixed.replace(/IN IP4 0.0.0.0/g, `IN IP4 ${ip}`);
    }
    return fixed;
};
exports.fixSdp = fixSdp;
const addIcesInAllBundles = (sdp) => {
    const parsedSdp = sdp_transform_1.default.parse(sdp);
    const mediaWithCandidate = parsedSdp.media.find(media => !!media.candidates);
    if (!mediaWithCandidate) {
        return sdp;
    }
    const { candidates, } = mediaWithCandidate;
    parsedSdp.media = parsedSdp.media.map(media => (Object.assign(Object.assign({}, media), { candidates: media.candidates || candidates })));
    return sdp_transform_1.default.write(parsedSdp);
};
exports.addIcesInAllBundles = addIcesInAllBundles;
