"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = __importDefault(require("./api"));
const aor_1 = __importDefault(require("./aor"));
const wazo_websocket_1 = __importDefault(require("./wazo-websocket"));
const webrtc_transport_1 = __importDefault(require("./webrtc-transport"));
const webrtc_1 = __importDefault(require("./webrtc"));
const symmetric_nat_1 = __importDefault(require("./symmetric-nat"));
const ice_ipv4_1 = __importDefault(require("./ice-ipv4"));
exports.default = [aor_1.default, api_1.default, wazo_websocket_1.default, webrtc_transport_1.default, webrtc_1.default, symmetric_nat_1.default, ice_ipv4_1.default];
