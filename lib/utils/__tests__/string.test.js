"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const string_1 = require("../string");
describe('string utils', () => {
    describe('camelToUnderscore', () => {
        it('', () => {
            // @ts-expect-error
            expect(() => (0, string_1.camelToUnderscore)(null)).toThrow('Input is not a string');
            // @ts-expect-error
            expect(() => (0, string_1.camelToUnderscore)(undefined)).toThrow('Input is not a string');
            // @ts-expect-error
            expect(() => (0, string_1.camelToUnderscore)({})).toThrow('Input is not a string');
            // @ts-expect-error
            expect(() => (0, string_1.camelToUnderscore)([])).toThrow('Input is not a string');
        });
        it('should convert camel-cased string to underscore', () => {
            expect((0, string_1.camelToUnderscore)('loremIpsum')).toEqual('lorem_ipsum');
            expect((0, string_1.camelToUnderscore)('lorem-ipsum')).toEqual('lorem-ipsum');
            expect((0, string_1.camelToUnderscore)('')).toEqual('');
        });
        it('should not prefix string with an underscore', () => {
            expect((0, string_1.camelToUnderscore)('LoremIpsum')).toEqual('lorem_ipsum');
            expect((0, string_1.camelToUnderscore)('L123')).toEqual('l123');
        });
    });
});
