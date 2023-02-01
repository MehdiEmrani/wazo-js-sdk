"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compare_version_1 = __importDefault(require("../compare-version"));
describe('Comparing versions', () => {
    it('should compare non semver versions', () => {
        expect((0, compare_version_1.default)('1.0', '1.0')).toBe(0);
        expect((0, compare_version_1.default)('0.10', '0.9')).toBeGreaterThan(0);
        expect((0, compare_version_1.default)('0.10', '0.11')).toBeLessThan(0);
        expect((0, compare_version_1.default)('0.10', '0.1')).toBeGreaterThan(0);
        expect((0, compare_version_1.default)('19.10', '19.1')).toBeGreaterThan(0);
    });
});
