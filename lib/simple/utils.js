"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLocalAudioStream = exports.createLocalVideoStream = void 0;
/* global navigator */
const index_1 = __importDefault(require("./index"));
const createLocalStream = (kind, options = {}) => __awaiter(void 0, void 0, void 0, function* () {
    const createOptions = {};
    createOptions[kind] = Object.keys(options).length > 0 ? options : true;
    const mediaStream = yield navigator.mediaDevices.getUserMedia(createOptions);
    return new index_1.default.Stream(mediaStream, new index_1.default.LocalParticipant(null, { call_id: 'some-call-id', caller_id_name: 'some-call-id-name' }));
});
const createLocalVideoStream = (options) => __awaiter(void 0, void 0, void 0, function* () { return createLocalStream('video', options); });
exports.createLocalVideoStream = createLocalVideoStream;
const createLocalAudioStream = (options) => __awaiter(void 0, void 0, void 0, function* () { return createLocalStream('audio', options); });
exports.createLocalAudioStream = createLocalAudioStream;
