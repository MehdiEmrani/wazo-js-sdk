"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ((instance, ToClass) => {
    const args = {};
    Object.getOwnPropertyNames(instance).forEach(prop => {
        args[prop] = instance[prop];
    });
    return new ToClass(args);
});
