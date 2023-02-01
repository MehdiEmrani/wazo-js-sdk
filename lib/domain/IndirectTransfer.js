"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const new_from_1 = __importDefault(require("../utils/new-from"));
const update_from_1 = __importDefault(require("../utils/update-from"));
class IndirectTransfer {
    constructor({ sourceId, destinationId, status, id, }) {
        this.sourceId = sourceId;
        this.destinationId = destinationId;
        this.status = status;
        this.id = id;
    }
    static parseFromCallSession(source, destination) {
        return new IndirectTransfer({
            sourceId: source.getId(),
            destinationId: destination.getId(),
        });
    }
    static parseFromApi(plain) {
        return new IndirectTransfer({
            id: plain.id,
            status: plain.status,
            sourceId: plain.initiator_call,
            destinationId: plain.recipient_call,
        });
    }
    destinationIs(callSession) {
        return callSession.isId(this.destinationId);
    }
    sourceIs(callSession) {
        return callSession.isId(this.sourceId);
    }
    updateFrom(indirectTransfer) {
        (0, update_from_1.default)(this, indirectTransfer);
    }
    static newFrom(indirectTransfer) {
        return (0, new_from_1.default)(indirectTransfer, IndirectTransfer);
    }
}
exports.default = IndirectTransfer;
