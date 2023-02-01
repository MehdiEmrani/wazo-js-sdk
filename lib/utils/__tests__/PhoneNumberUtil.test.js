"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PhoneNumberUtil_1 = require("../PhoneNumberUtil");
describe('Formatting phone numbers', () => {
    it('should not format all phone numbers', () => {
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('*143450', 'FR')).toBe('*143450');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('*10', 'US')).toBe('*10');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('Wazo Fax', 'US')).toBe('Wazo Fax');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('#23445433', 'DE')).toBe('#23445433');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('0080510', 'FR')).toBe('0080510');
    });
    it('should format real phone numbers', () => {
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('+33675456545', 'FR')).toBe('06 75 45 65 45');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('0675456545', 'FR')).toBe('06 75 45 65 45');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('+33675456545', 'US')).toBe('+33 6 75 45 65 45');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('0675456545', 'US')).toBe('+1 0675456545');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('4188884356', 'US')).toBe('(418) 888-4356');
    });
    it('should format real phone numbers when typing', () => {
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('+3367545', 'FR', true)).toBe('+33 6 75 45');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('067545', 'FR', true)).toBe('06 75 45');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('+3367545', 'US', true)).toBe('+33 6 75 45');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('067545', 'US', true)).toBe('067545');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('418808', 'US', true)).toBe('418-808');
    });
    it('should use the international number if the country number is different from the given country', () => {
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('00201005803648', 'FR')).toBe('+20 100 580 3648');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('+14188004554', 'FR')).toBe('+1 418-800-4554');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('00201005803648', 'EG')).toBe('0100 580 3648');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('0634543450', 'FR')).toBe('06 34 54 34 50');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('4188034302', 'US')).toBe('(418) 803-4302');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('8775863230', 'CA')).toBe('(877) 586-3230');
        expect((0, PhoneNumberUtil_1.getDisplayableNumber)('8775863230', 'US')).toBe('(877) 586-3230');
    });
});
describe('getCallableNumber', () => {
    it('works with a country', () => {
        expect((0, PhoneNumberUtil_1.getCallableNumber)('+33 6 75 45 12 34', 'FR')).toBe('0675451234');
        expect((0, PhoneNumberUtil_1.getCallableNumber)('06 75 45 12 34', 'FR')).toBe('0675451234');
        expect((0, PhoneNumberUtil_1.getCallableNumber)('+1-202-555-0147', 'US')).toBe('2025550147');
        expect((0, PhoneNumberUtil_1.getCallableNumber)('202-555-0113', 'US')).toBe('2025550113');
        expect((0, PhoneNumberUtil_1.getCallableNumber)('8008', 'US')).toBe('8008');
        expect((0, PhoneNumberUtil_1.getCallableNumber)('80.08', 'US')).toBe('8008');
        expect((0, PhoneNumberUtil_1.getCallableNumber)('*10', 'US')).toBe('*10');
        expect((0, PhoneNumberUtil_1.getCallableNumber)('9000', 'US')).toBe('9000');
    });
    it('works without a country', () => {
        // @ts-expect-error
        expect((0, PhoneNumberUtil_1.getCallableNumber)('06 75 45')).toBe('067545');
        // @ts-expect-error
        expect((0, PhoneNumberUtil_1.getCallableNumber)('067-545')).toBe('067545');
        // @ts-expect-error
        expect((0, PhoneNumberUtil_1.getCallableNumber)('8008')).toBe('8008');
        // @ts-expect-error
        expect((0, PhoneNumberUtil_1.getCallableNumber)('80.08')).toBe('8008');
        // @ts-expect-error
        expect((0, PhoneNumberUtil_1.getCallableNumber)('*10')).toBe('*10');
        // @ts-expect-error
        expect((0, PhoneNumberUtil_1.getCallableNumber)('9000')).toBe('9000');
    });
});
