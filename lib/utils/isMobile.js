"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* global navigator */
const isMobile = () => typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
exports.default = isMobile;
