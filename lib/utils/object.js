"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertKeysFromCamelToUnderscore = void 0;
const string_1 = require("./string");
const convertKeysFromCamelToUnderscore = (args) => {
    if (!args || typeof args !== 'object' || Array.isArray(args)) {
        throw new Error('Input is not an object');
    }
    return Object.keys(args).reduce((acc, key) => {
        acc[(0, string_1.camelToUnderscore)(key)] = typeof args[key] === 'object' && !Array.isArray(args[key]) ? (0, exports.convertKeysFromCamelToUnderscore)(args[key]) : args[key];
        return acc;
    }, {});
};
exports.convertKeysFromCamelToUnderscore = convertKeysFromCamelToUnderscore;
