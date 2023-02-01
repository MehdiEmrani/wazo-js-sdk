"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonToGraphQLQuery_1 = require("json-to-graphql-query/lib/jsonToGraphQLQuery");
const api_requester_1 = __importDefault(require("../utils/api-requester"));
const Contact_1 = __importDefault(require("../domain/Contact"));
const getContactPayload = (contact) => ({
    email: contact.email,
    // @ts-ignore
    firstname: contact.firstName ? contact.firstName : '',
    // @ts-ignore
    lastname: contact.lastName ? contact.lastName : '',
    // @ts-ignore
    number: contact.phoneNumber ? contact.phoneNumber : '',
    entreprise: contact.entreprise ? contact.entreprise : '',
    birthday: contact.birthday ? contact.birthday : '',
    address: contact.address ? contact.address : '',
    note: contact.note ? contact.note : '',
});
exports.default = ((client, baseUrl) => ({
    search: (context, term) => client.get(`${baseUrl}/directories/lookup/${context}`, {
        term,
    }).then(Contact_1.default.parseMany),
    listPersonalContacts: (queryParams = null) => client.get(`${baseUrl}/personal`, queryParams).then((response) => Contact_1.default.parseManyPersonal(response.items)),
    fetchPersonalContact: (contactUuid) => client.get(`${baseUrl}/personal/${contactUuid}`).then(Contact_1.default.parsePersonal),
    addContact: (contact) => client.post(`${baseUrl}/personal`, getContactPayload(contact)).then(Contact_1.default.parsePersonal),
    editContact: (contact) => client.put(`${baseUrl}/personal/${contact.sourceId || contact.id || ''}`, getContactPayload(contact)).then(Contact_1.default.parsePersonal),
    importContacts: (csv) => {
        const headers = {
            'Content-Type': 'text/csv; charset=utf-8',
            'X-Auth-Token': client.token,
        };
        return client.post(`${baseUrl}/personal/import`, csv, headers).then((result) => Contact_1.default.parseManyPersonal(result.created));
    },
    deleteContact: (contactUuid) => client.delete(`${baseUrl}/personal/${contactUuid}`),
    listFavorites: (context) => client.get(`${baseUrl}/directories/favorites/${context}`).then(Contact_1.default.parseMany),
    markAsFavorite: (source, sourceId) => {
        const url = `${baseUrl}/directories/favorites/${source}/${sourceId}`;
        return client.put(url, null, null, api_requester_1.default.successResponseParser);
    },
    removeFavorite: (source, sourceId) => client.delete(`${baseUrl}/directories/favorites/${source}/${sourceId}`),
    fetchOffice365Source: (context) => client.get(`${baseUrl}/directories/${context}/sources`, {
        backend: 'office365',
    }),
    fetchOffice365Contacts: (source, queryParams = null) => {
        if (!source) {
            return null;
        }
        return client.get(`${baseUrl}/backends/office365/sources/${source.uuid}/contacts`, queryParams).then((response) => Contact_1.default.parseManyOffice365(response.items, source));
    },
    fetchWazoSource: (context) => client.get(`${baseUrl}/directories/${context}/sources`, {
        backend: 'wazo',
    }),
    // Can be used with `queryParams = { uuid: uuid1, uuid2 }` to fetch multiple contacts
    fetchWazoContacts: (source, queryParams = null) => {
        if (!source) {
            return null;
        }
        return client.get(`${baseUrl}/backends/wazo/sources/${source.uuid}/contacts`, queryParams).then((response) => Contact_1.default.parseManyWazo(response.items, source));
    },
    fetchGoogleSource: (context) => client.get(`${baseUrl}/directories/${context}/sources`, {
        backend: 'google',
    }),
    fetchGoogleContacts: (source, queryParams = null) => {
        if (!source) {
            return null;
        }
        return client.get(`${baseUrl}/backends/google/sources/${source.uuid}/contacts`, queryParams).then((response) => Contact_1.default.parseManyGoogle(response.items, source));
    },
    fetchConferenceSource: (context) => client.get(`${baseUrl}/directories/${context}/sources`, {
        backend: 'conference',
    }),
    fetchConferenceContacts: (source) => {
        if (!source) {
            return null;
        }
        return client.get(`${baseUrl}/backends/conference/sources/${source.uuid}/contacts`).then((response) => Contact_1.default.parseManyConference(response.items, source));
    },
    // Graphql
    findMultipleContactsByNumber: (numbers, fields) => {
        const query = (0, jsonToGraphQLQuery_1.jsonToGraphQLQuery)({
            me: {
                contacts: {
                    __args: {
                        profile: 'default',
                        extens: numbers,
                    },
                    edges: {
                        node: fields || {
                            firstname: true,
                            lastname: true,
                            wazoReverse: true,
                            wazoBackend: true,
                            email: true,
                            wazoSourceEntryId: true,
                            wazoSourceName: true,
                            '... on WazoContact': {
                                userUuid: true,
                            },
                        },
                    },
                },
            },
        });
        return client.post(`${baseUrl}/graphql`, {
            query: `{${query}}`,
        }).then(Contact_1.default.manyGraphQlWithNumbersParser(numbers));
    },
}));
