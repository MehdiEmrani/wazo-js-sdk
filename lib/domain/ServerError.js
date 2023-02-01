"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BadResponse_1 = __importDefault(require("./BadResponse"));
class ServerError extends BadResponse_1.default {
    static fromResponse(error, status) {
        return new ServerError(error.message || JSON.stringify(error), status, error.timestamp, error.error_id, error.details);
    }
    static fromText(response, status) {
        return new ServerError(response, status);
    }
}
exports.default = ServerError;
