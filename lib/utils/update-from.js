"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-param-reassign */
exports.default = ((instance, from) => {
    Object.keys(from)
        .forEach(key => {
        if ((!instance[key] && from[key])
            || (typeof instance[key] !== 'undefined' && typeof from[key] !== 'undefined' && instance[key] !== from[key])) {
            instance[key] = from[key];
        }
    });
});
