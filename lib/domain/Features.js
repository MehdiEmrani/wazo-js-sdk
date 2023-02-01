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
exports.getScopeName = exports.FEATURES = void 0;
const getApiClient_1 = __importDefault(require("../service/getApiClient"));
exports.FEATURES = ['chat', 'video', 'call_recording', 'fax', 'mobile_double_call', 'mobile_gsm', 'meeting'];
const getScopeName = (featureName) => `enterprise.app.${featureName}`;
exports.getScopeName = getScopeName;
const scopesToCheck = exports.FEATURES.map(exports.getScopeName); // Handle available features on the engine.
class Features {
    constructor() {
        this._hasChat = true;
        this._hasVideo = true;
        this._hasCallRecording = true;
        this._hasFax = true;
        this._hasMobileDoubleCall = true;
        this._hasMobileGsm = true;
        this._hasMeeting = true;
    }
    fetchAccess() {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            try {
                response = yield (0, getApiClient_1.default)().auth.getRestrictionPolicies(scopesToCheck);
            }
            catch (_) { // Noting to do because everything should be available even if the API is not available
            }
            if (!response) {
                return;
            }
            const { scopes, } = response;
            this._hasChat = this._hasFeatures(scopes, 'chat');
            this._hasVideo = this._hasFeatures(scopes, 'video');
            this._hasCallRecording = this._hasFeatures(scopes, 'call_recording');
            this._hasFax = this._hasFeatures(scopes, 'fax');
            this._hasMobileDoubleCall = this._hasFeatures(scopes, 'mobile_double_call');
            this._hasMobileGsm = this._hasFeatures(scopes, 'mobile_gsm');
            this._hasMeeting = this._hasFeatures(scopes, 'meeting');
        });
    }
    hasChat() {
        return this._hasChat;
    }
    hasVideo() {
        return this._hasVideo;
    }
    hasCallRecording() {
        return this._hasCallRecording;
    }
    hasFax() {
        return this._hasFax;
    }
    hasMobileDoubleCall() {
        return this._hasMobileDoubleCall;
    }
    hasMobileGsm() {
        return this._hasMobileGsm;
    }
    hasMeeting() {
        return this._hasMeeting;
    }
    _hasFeatures(scopes, featureName) {
        const scopeName = (0, exports.getScopeName)(featureName);
        if (!scopes || !(scopeName in scopes)) {
            // Assume that the feature is available if not present (available by default)
            return true;
        }
        return scopes[scopeName] === true;
    }
}
exports.default = new Features();
