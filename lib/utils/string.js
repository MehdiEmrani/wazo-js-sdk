"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camelToUnderscore = void 0;
const camelToUnderscore = (key) => {
    if (typeof key !== 'string') {
        throw new Error('Input is not a string');
    }
    return key.charAt(0).toLowerCase() + key.substring(1).replace(/([A-Z])/g, '_$1').toLowerCase();
};
exports.camelToUnderscore = camelToUnderscore;
