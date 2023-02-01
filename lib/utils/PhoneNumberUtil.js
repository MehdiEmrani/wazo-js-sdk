"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCallableNumber = exports.getDisplayableNumber = exports.AsYouTypeFormatter = exports.parsePhoneNumber = exports.PhoneNumberFormat = exports.PhoneNumberUtil = void 0;
const google_libphonenumber_1 = __importDefault(require("google-libphonenumber"));
const PhoneNumberUtil = google_libphonenumber_1.default.PhoneNumberUtil.getInstance();
exports.PhoneNumberUtil = PhoneNumberUtil;
const { PhoneNumberFormat, AsYouTypeFormatter, } = google_libphonenumber_1.default;
exports.PhoneNumberFormat = PhoneNumberFormat;
exports.AsYouTypeFormatter = AsYouTypeFormatter;
// eslint-disable-next-line
const EXTRA_CHAR_REGEXP = /[^+*\d]/g;
const shouldBeFormatted = (number) => {
    if (!number || number.length <= 5) {
        return false;
    }
    return !number.includes('#') && !number.includes('*') && !number.match(/[aA-zZ]/);
};
const isSameCountry = (country1, country2) => {
    if ((country1 === 'US' && country2 === 'CA') || (country2 === 'US' && country1 === 'CA')) {
        return true;
    }
    return country1 === country2;
};
const getDisplayableNumber = (rawNumber, country, asYouType = false) => {
    if (!rawNumber) {
        return rawNumber;
    }
    const number = String(rawNumber);
    if (!shouldBeFormatted(number)) {
        return number;
    }
    let displayValue = '';
    if (asYouType) {
        const formatter = new AsYouTypeFormatter(country);
        number.split('').forEach(char => {
            displayValue = formatter.inputDigit(char);
        });
    }
    else {
        try {
            const parsedNumber = PhoneNumberUtil.parseAndKeepRawInput(number, country);
            const numberCountry = PhoneNumberUtil.getRegionCodeForNumber(parsedNumber);
            const format = isSameCountry(String(numberCountry), country) ? PhoneNumberFormat.NATIONAL : PhoneNumberFormat.INTERNATIONAL;
            displayValue = PhoneNumberUtil.format(parsedNumber, format);
        }
        catch (_) {
            // Avoid to crash when phone number like `0080510` can't be parsed
            displayValue = rawNumber;
        }
    }
    return displayValue;
};
exports.getDisplayableNumber = getDisplayableNumber;
const parsePhoneNumber = (phoneNumber) => phoneNumber.replace(EXTRA_CHAR_REGEXP, '');
exports.parsePhoneNumber = parsePhoneNumber;
const getCallableNumber = (number, country) => {
    try {
        if (country) {
            return getDisplayableNumber(number, country).replace(EXTRA_CHAR_REGEXP, '');
        }
        return parsePhoneNumber(number);
    }
    catch (_) {
        return number;
    }
};
exports.getCallableNumber = getCallableNumber;
