"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const new_from_1 = __importDefault(require("../utils/new-from"));
class ExternalApp {
    static parse(plain) {
        return new ExternalApp({
            name: plain.name,
            configuration: plain.configuration,
        });
    }
    static parseMany(plain) {
        return plain.items.map(item => ExternalApp.parse(item));
    }
    static newFrom(profile) {
        return (0, new_from_1.default)(profile, ExternalApp);
    }
    constructor({ name, configuration, } = {}) {
        this.name = name;
        this.configuration = configuration;
        // Useful to compare instead of instanceof with minified code
        this.type = 'ExternalApp';
    }
}
exports.default = ExternalApp;
