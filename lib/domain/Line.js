"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const new_from_1 = __importDefault(require("../utils/new-from"));
class Line {
    static parse(plain) {
        return new Line({
            id: plain.id,
            extensions: plain.extensions,
            endpointCustom: plain.endpoint_custom || null,
            endpointSccp: plain.endpoint_sccp || null,
            endpointSip: plain.endpoint_sip || null,
        });
    }
    static newFrom(profile) {
        return (0, new_from_1.default)(profile, Line);
    }
    is(line) {
        return line ? this.id === line.id : false;
    }
    hasExtension(extension) {
        if (!this.extensions) {
            return false;
        }
        return this.extensions.some(ext => ext.exten === extension);
    }
    constructor({ id, extensions, endpointCustom, endpointSccp, endpointSip, } = {}) {
        this.id = id;
        this.extensions = extensions;
        this.endpointCustom = endpointCustom || null;
        this.endpointSccp = endpointSccp || null;
        this.endpointSip = endpointSip || null;
        // Useful to compare instead of instanceof with minified code
        this.type = 'Line';
    }
}
exports.default = Line;
