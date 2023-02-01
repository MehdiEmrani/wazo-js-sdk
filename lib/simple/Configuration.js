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
const Auth_1 = __importDefault(require("./Auth"));
const getApiClient_1 = __importDefault(require("../service/getApiClient"));
class Configuration {
    getCurrentUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const session = Auth_1.default.getSession();
            return (0, getApiClient_1.default)().confd.getUser(session ? session.uuid : '');
        });
    }
}
if (!global.wazoConfigurationInstance) {
    global.wazoConfigurationInstance = new Configuration();
}
exports.default = global.wazoConfigurationInstance;
