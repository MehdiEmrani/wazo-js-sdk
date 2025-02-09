import { camelToUnderscore } from './string';
export const convertKeysFromCamelToUnderscore = (args) => {
    if (!args || typeof args !== 'object' || Array.isArray(args)) {
        throw new Error('Input is not an object');
    }
    return Object.keys(args).reduce((acc, key) => {
        acc[camelToUnderscore(key)] = typeof args[key] === 'object' && !Array.isArray(args[key]) ? convertKeysFromCamelToUnderscore(args[key]) : args[key];
        return acc;
    }, {});
};
