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
const Heartbeat_1 = __importDefault(require("../Heartbeat"));
describe('Heartbeat', () => {
    describe('When onHearbeat is not called', () => {
        it('should retry the call with a new token', () => __awaiter(void 0, void 0, void 0, function* () {
            const spy = jest.fn();
            const heartbeat = new Heartbeat_1.default(10, 50, 2);
            heartbeat.setOnHeartbeatTimeout(spy);
            heartbeat.start();
            yield new Promise(resolve => setTimeout(resolve, 70));
            expect(spy).toHaveBeenCalled();
        }));
    });
    describe('When onHearbeat is called', () => {
        it('should not call onTimeout', () => __awaiter(void 0, void 0, void 0, function* () {
            const timeout = jest.fn();
            const sendHeartbeat = jest.fn();
            const heartbeat = new Heartbeat_1.default(10, 50, 2);
            heartbeat.setSendHeartbeat(sendHeartbeat);
            heartbeat.setOnHeartbeatTimeout(timeout);
            heartbeat.start();
            setTimeout(() => {
                heartbeat.onHeartbeat();
            }, 30);
            yield new Promise(resolve => setTimeout(resolve, 70));
            expect(sendHeartbeat).toHaveBeenCalled();
            expect(timeout).not.toHaveBeenCalled();
        }));
    });
    describe('When onHearbeat is called every times', () => {
        it('should not timeout', () => __awaiter(void 0, void 0, void 0, function* () {
            const timeout = jest.fn();
            const heartbeat = new Heartbeat_1.default(5, 50, 8);
            const sendHeartbeat = jest.fn(() => {
                heartbeat.onHeartbeat();
            });
            heartbeat.setSendHeartbeat(sendHeartbeat);
            heartbeat.setOnHeartbeatTimeout(timeout);
            heartbeat.start();
            yield new Promise(resolve => setTimeout(resolve, 100));
            expect(sendHeartbeat).toHaveBeenNthCalledWith(8);
            expect(timeout).not.toHaveBeenCalled();
        }));
    });
    describe('When calling it twice', () => {
        it('should work like the first time', () => __awaiter(void 0, void 0, void 0, function* () {
            const timeout = jest.fn();
            const heartbeat = new Heartbeat_1.default(5, 50, 8);
            const sendHeartbeat = jest.fn(() => {
                heartbeat.onHeartbeat();
            });
            heartbeat.setSendHeartbeat(sendHeartbeat);
            heartbeat.setOnHeartbeatTimeout(timeout);
            // First call
            heartbeat.start();
            yield new Promise(resolve => setTimeout(resolve, 100));
            expect(sendHeartbeat).toHaveBeenNthCalledWith(8);
            expect(timeout).not.toHaveBeenCalled();
            // Second call
            heartbeat.setSendHeartbeat(() => { });
            heartbeat.start();
            yield new Promise(resolve => setTimeout(resolve, 100));
            expect(timeout).toHaveBeenCalled();
        }));
    });
});
