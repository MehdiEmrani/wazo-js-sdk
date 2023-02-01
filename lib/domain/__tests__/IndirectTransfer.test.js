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
// @ts-nocheck
const CallSession_1 = __importDefault(require("../CallSession"));
const IndirectTransfer_1 = __importDefault(require("../IndirectTransfer"));
describe('Indirect transfer', () => {
    describe('on parse from call session', () => {
        it('should return valid IndirectTransfer', () => __awaiter(void 0, void 0, void 0, function* () {
            const sourceId = 'source-id';
            const destinationId = 'destination-id';
            const indirectTransfer = IndirectTransfer_1.default.parseFromCallSession(new CallSession_1.default({
                callId: sourceId,
            }), new CallSession_1.default({
                callId: destinationId,
            }));
            expect(indirectTransfer).toEqual({
                sourceId,
                destinationId,
            });
        }));
    });
    describe('on check destination', () => {
        it('should match when destination is the same', () => __awaiter(void 0, void 0, void 0, function* () {
            const destinationId = 'destination-id';
            const indirectTransfer = new IndirectTransfer_1.default({
                sourceId: 'some-id',
                destinationId,
            });
            const isDestination = indirectTransfer.destinationIs(new CallSession_1.default({
                callId: destinationId,
            }));
            expect(isDestination).toBeTruthy();
        }));
        it('should NOT match when destination is the different', () => __awaiter(void 0, void 0, void 0, function* () {
            const destinationId = 'destination-id';
            const indirectTransfer = new IndirectTransfer_1.default({
                sourceId: 'some-id',
                destinationId: 'some-other-id',
            });
            const isDestination = indirectTransfer.destinationIs(new CallSession_1.default({
                callId: destinationId,
            }));
            expect(isDestination).toBeFalsy();
        }));
    });
    describe('on check source', () => {
        it('should match when source is the same', () => __awaiter(void 0, void 0, void 0, function* () {
            const sourceId = 'source-id';
            const indirectTransfer = new IndirectTransfer_1.default({
                destinationId: 'some-id',
                sourceId,
            });
            const isSource = indirectTransfer.sourceIs(new CallSession_1.default({
                callId: sourceId,
            }));
            expect(isSource).toBeTruthy();
        }));
        it('should NOT match when source is the different', () => __awaiter(void 0, void 0, void 0, function* () {
            const sourceId = 'source-id';
            const indirectTransfer = new IndirectTransfer_1.default({
                sourceId: 'some-id',
                destinationId: 'some-other-id',
            });
            const isSource = indirectTransfer.sourceIs(new CallSession_1.default({
                callId: sourceId,
            }));
            expect(isSource).toBeFalsy();
        }));
    });
});
