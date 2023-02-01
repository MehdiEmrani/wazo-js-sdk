import newFrom from '../utils/new-from';
export default class ExternalApp {
    name;
    type;
    configuration;
    static parse(plain) {
        return new ExternalApp({
            name: plain.name,
            configuration: plain.configuration,
        });
    }
    static parseMany(plain) {
        return plain.items.map(item => ExternalApp.parse(item));
    }
    static newFrom(profile) {
        return newFrom(profile, ExternalApp);
    }
    constructor({ name, configuration, } = {}) {
        this.name = name;
        this.configuration = configuration;
        // Useful to compare instead of instanceof with minified code
        this.type = 'ExternalApp';
    }
}
