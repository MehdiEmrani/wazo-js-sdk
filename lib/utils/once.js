"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable */
// Can't use arrow function here due to `apply`
function default_1(func) {
    let ran = false;
    let memo;
    return function () {
        if (ran)
            return memo;
        ran = true;
        // @ts-ignore
        memo = func && func.apply(this, arguments);
        func = null;
        return memo;
    };
}
exports.default = default_1;
