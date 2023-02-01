/* global navigator */
import Wazo from './index';
const createLocalStream = async (kind, options = {}) => {
    const createOptions = {};
    createOptions[kind] = Object.keys(options).length > 0 ? options : true;
    const mediaStream = await navigator.mediaDevices.getUserMedia(createOptions);
    return new Wazo.Stream(mediaStream, new Wazo.LocalParticipant(null, { call_id: 'some-call-id', caller_id_name: 'some-call-id-name' }));
};
export const createLocalVideoStream = async (options) => createLocalStream('video', options);
export const createLocalAudioStream = async (options) => createLocalStream('audio', options);
