"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const object_1 = require("../object");
describe('object utils', () => {
    describe('convertKeysFromCamelToUnderscore', () => {
        it('should throw an error when input is not an object', () => {
            const msg = 'Input is not an object';
            // @ts-expect-error
            expect(() => (0, object_1.convertKeysFromCamelToUnderscore)(true)).toThrow(msg);
            // @ts-expect-error
            expect(() => (0, object_1.convertKeysFromCamelToUnderscore)(null)).toThrow(msg);
            // @ts-expect-error
            expect(() => (0, object_1.convertKeysFromCamelToUnderscore)(undefined)).toThrow(msg);
            expect(() => (0, object_1.convertKeysFromCamelToUnderscore)([])).toThrow(msg);
            // @ts-expect-error
            expect(() => (0, object_1.convertKeysFromCamelToUnderscore)('some-string')).toThrow(msg);
        });
        it('should convert camel-cased keys to underscore', () => {
            let value = Math.random();
            expect((0, object_1.convertKeysFromCamelToUnderscore)({
                LoremIpsum: value,
            })).toEqual({
                lorem_ipsum: value,
            });
            value = Math.random();
            expect((0, object_1.convertKeysFromCamelToUnderscore)({
                loremIpsum: value,
            })).toEqual({
                lorem_ipsum: value,
            });
            value = Math.random();
            expect((0, object_1.convertKeysFromCamelToUnderscore)({
                'lorem-ipsum': value,
            })).toEqual({
                'lorem-ipsum': value,
            });
            value = Math.random();
            expect((0, object_1.convertKeysFromCamelToUnderscore)({
                L123: value,
            })).toEqual({
                l123: value,
            });
        });
        it('should handle multi-leveled object', () => {
            const value = Math.random();
            expect((0, object_1.convertKeysFromCamelToUnderscore)({
                LoremIpsum: {
                    DoloreSit: {
                        Amet: value,
                    },
                    regular: 'reg',
                },
            })).toEqual({
                lorem_ipsum: {
                    dolore_sit: {
                        amet: value,
                    },
                    regular: 'reg',
                },
            });
            expect((0, object_1.convertKeysFromCamelToUnderscore)({
                LoremIpsum: {
                    DoloreSit: {
                        Amet: [value],
                    },
                    regular: ['something'],
                },
            })).toEqual({
                lorem_ipsum: {
                    dolore_sit: {
                        amet: [value],
                    },
                    regular: ['something'],
                },
            });
        });
    });
});
