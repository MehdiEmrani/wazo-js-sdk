import sdpParser from 'sdp-transform';
export const getCandidates = (rawSdp) => {
    if (!rawSdp) {
        return [];
    }
    const sdp = sdpParser.parse(rawSdp);
    if (!sdp || !sdp.media) {
        return [];
    }
    return sdp.media.map((media) => media.candidates).flat().filter((candidate) => !!candidate);
};
export const parseCandidate = (candidate) => {
    if (!candidate) {
        return null;
    }
    const result = sdpParser.parse(candidate.indexOf('a=') === 0 ? candidate : `a=${candidate}`);
    return result.candidates ? result.candidates[0] : null;
};
const getSrflxOrRelay = (candidates) => candidates.filter(candidate => candidate && (candidate.type === 'srflx' || candidate.type === 'relay'));
export const areCandidateValid = (candidates) => getSrflxOrRelay(candidates).length > 0;
export const isSdpValid = (sdp) => {
    const candidates = getCandidates(sdp);
    return areCandidateValid(candidates);
};
export const fixBundle = (sdp) => {
    const parsedSdp = sdpParser.parse(sdp);
    const bundleIndex = parsedSdp.groups.findIndex((group) => group.type === 'BUNDLE');
    if (bundleIndex !== -1) {
        parsedSdp.groups[bundleIndex].mids = parsedSdp.media.map((media, index) => ('mid' in media ? media.mid : index)).join(' ');
    }
    return sdpParser.write(parsedSdp);
};
export const toggleVideoDirection = (sdp, direction) => {
    const parsedSdp = sdpParser.parse(sdp);
    parsedSdp.media = parsedSdp.media.map((media) => ({ ...media,
        ...(media.type === 'video' ? {
            direction,
        } : {}),
    }));
    return sdpParser.write(parsedSdp);
};
export const getVideoDirection = (sdp) => {
    const parsedSdp = sdpParser.parse(sdp);
    const videoMedia = parsedSdp.media.find(media => media.type === 'video');
    if (!videoMedia) {
        return null;
    }
    return videoMedia.direction;
};
export const deactivateVideoModifier = (rawDescription) => {
    const description = rawDescription;
    description.sdp = toggleVideoDirection(description.sdp, 'inactive');
    return Promise.resolve(description);
};
export const activateVideoModifier = (rawDescription) => {
    const description = rawDescription;
    description.sdp = toggleVideoDirection(description.sdp, 'sendrecv');
    return Promise.resolve(description);
};
export const hasAnActiveVideo = (sdp) => {
    if (!sdp) {
        return false;
    }
    const parsedSdp = sdpParser.parse(sdp);
    return !!parsedSdp.media.find(media => media.type === 'video' && media.port > 10 && (!media.direction || media.direction !== 'inactive'));
};
export const fixSdp = (sdp, candidates, forcePort = true) => {
    const parsedSdp = sdpParser.parse(sdp);
    const mainCandidate = getSrflxOrRelay(candidates)[0];
    const ip = mainCandidate ? mainCandidate.ip : null;
    if (ip) {
        parsedSdp.origin.address = ip;
    }
    parsedSdp.media = parsedSdp.media.map((media) => {
        const port = forcePort ? mainCandidate ? mainCandidate.port : media.port : media.port;
        return { ...media,
            port,
            candidates: (media.candidates || []).concat(candidates),
            direction: port < 10 ? 'inactive' : media.direction,
        };
    });
    let fixed = sdpParser.write(parsedSdp);
    if (ip) {
        fixed = fixed.replace(/IN IP4 0.0.0.0/g, `IN IP4 ${ip}`);
    }
    return fixed;
};
export const addIcesInAllBundles = (sdp) => {
    const parsedSdp = sdpParser.parse(sdp);
    const mediaWithCandidate = parsedSdp.media.find(media => !!media.candidates);
    if (!mediaWithCandidate) {
        return sdp;
    }
    const { candidates, } = mediaWithCandidate;
    parsedSdp.media = parsedSdp.media.map(media => ({ ...media,
        candidates: media.candidates || candidates,
    }));
    return sdpParser.write(parsedSdp);
};
