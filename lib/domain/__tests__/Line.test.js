"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Line_1 = __importDefault(require("../Line"));
describe('Line domain', () => {
    it('can parse a plain line to domain', () => {
        const response = {
            id: 8,
            endpoint_sip: {
                id: 19,
                username: 'ipcor1pj',
                links: [{
                        href: 'https://stack.example.com/api/confd/1.1/endpoints/sip/19',
                        rel: 'endpoint_sip',
                    }],
            },
            endpoint_sccp: null,
            endpoint_custom: null,
            extensions: [{
                    id: 59,
                    exten: '8020',
                    context: 'default',
                    links: [{
                            href: 'https://stack.example.com/api/confd/1.1/extensions/59',
                            rel: 'extensions',
                        }],
                }],
            links: [{
                    href: 'https://stack.example.com/api/confd/1.1/lines/8',
                    rel: 'lines',
                }],
        };
        const line = Line_1.default.parse(response);
        expect(line).toEqual(new Line_1.default({
            id: 8,
            extensions: [{
                    id: 59,
                    exten: '8020',
                    context: 'default',
                    links: [{
                            href: 'https://stack.example.com/api/confd/1.1/extensions/59',
                            rel: 'extensions',
                        }],
                }],
            endpointSip: {
                id: 19,
                links: [{
                        href: 'https://stack.example.com/api/confd/1.1/endpoints/sip/19',
                        rel: 'endpoint_sip',
                    }],
                username: 'ipcor1pj',
            },
        }));
    });
});
