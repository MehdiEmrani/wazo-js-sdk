import LibPhoneNumber from 'google-libphonenumber';
declare const PhoneNumberUtil: LibPhoneNumber.PhoneNumberUtil;
declare const PhoneNumberFormat: typeof LibPhoneNumber.PhoneNumberFormat, AsYouTypeFormatter: typeof LibPhoneNumber.AsYouTypeFormatter;
declare const getDisplayableNumber: (rawNumber: string, country: string, asYouType?: boolean) => string;
declare const parsePhoneNumber: (phoneNumber: string) => string;
declare const getCallableNumber: (number: string, country: string | null | undefined) => string | null | undefined;
export { PhoneNumberUtil, PhoneNumberFormat, parsePhoneNumber, AsYouTypeFormatter, getDisplayableNumber, getCallableNumber };
//# sourceMappingURL=PhoneNumberUtil.d.ts.map