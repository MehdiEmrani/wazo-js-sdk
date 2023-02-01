import { jsonToGraphQLQuery } from 'json-to-graphql-query/lib/jsonToGraphQLQuery';
import ApiRequester from '../utils/api-requester';
import Contact from '../domain/Contact';
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
export default ((client, baseUrl) => ({
    search: (context, term) => client.get(`${baseUrl}/directories/lookup/${context}`, {
        term,
    }).then(Contact.parseMany),
    listPersonalContacts: (queryParams = null) => client.get(`${baseUrl}/personal`, queryParams).then((response) => Contact.parseManyPersonal(response.items)),
    fetchPersonalContact: (contactUuid) => client.get(`${baseUrl}/personal/${contactUuid}`).then(Contact.parsePersonal),
    addContact: (contact) => client.post(`${baseUrl}/personal`, getContactPayload(contact)).then(Contact.parsePersonal),
    editContact: (contact) => client.put(`${baseUrl}/personal/${contact.sourceId || contact.id || ''}`, getContactPayload(contact)).then(Contact.parsePersonal),
    importContacts: (csv) => {
        const headers = {
            'Content-Type': 'text/csv; charset=utf-8',
            'X-Auth-Token': client.token,
        };
        return client.post(`${baseUrl}/personal/import`, csv, headers).then((result) => Contact.parseManyPersonal(result.created));
    },
    deleteContact: (contactUuid) => client.delete(`${baseUrl}/personal/${contactUuid}`),
    listFavorites: (context) => client.get(`${baseUrl}/directories/favorites/${context}`).then(Contact.parseMany),
    markAsFavorite: (source, sourceId) => {
        const url = `${baseUrl}/directories/favorites/${source}/${sourceId}`;
        return client.put(url, null, null, ApiRequester.successResponseParser);
    },
    removeFavorite: (source, sourceId) => client.delete(`${baseUrl}/directories/favorites/${source}/${sourceId}`),
    fetchOffice365Source: (context) => client.get(`${baseUrl}/directories/${context}/sources`, {
        backend: 'office365',
    }),
    fetchOffice365Contacts: (source, queryParams = null) => {
        if (!source) {
            return null;
        }
        return client.get(`${baseUrl}/backends/office365/sources/${source.uuid}/contacts`, queryParams).then((response) => Contact.parseManyOffice365(response.items, source));
    },
    fetchWazoSource: (context) => client.get(`${baseUrl}/directories/${context}/sources`, {
        backend: 'wazo',
    }),
    // Can be used with `queryParams = { uuid: uuid1, uuid2 }` to fetch multiple contacts
    fetchWazoContacts: (source, queryParams = null) => {
        if (!source) {
            return null;
        }
        return client.get(`${baseUrl}/backends/wazo/sources/${source.uuid}/contacts`, queryParams).then((response) => Contact.parseManyWazo(response.items, source));
    },
    fetchGoogleSource: (context) => client.get(`${baseUrl}/directories/${context}/sources`, {
        backend: 'google',
    }),
    fetchGoogleContacts: (source, queryParams = null) => {
        if (!source) {
            return null;
        }
        return client.get(`${baseUrl}/backends/google/sources/${source.uuid}/contacts`, queryParams).then((response) => Contact.parseManyGoogle(response.items, source));
    },
    fetchConferenceSource: (context) => client.get(`${baseUrl}/directories/${context}/sources`, {
        backend: 'conference',
    }),
    fetchConferenceContacts: (source) => {
        if (!source) {
            return null;
        }
        return client.get(`${baseUrl}/backends/conference/sources/${source.uuid}/contacts`).then((response) => Contact.parseManyConference(response.items, source));
    },
    // Graphql
    findMultipleContactsByNumber: (numbers, fields) => {
        const query = jsonToGraphQLQuery({
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
        }).then(Contact.manyGraphQlWithNumbersParser(numbers));
    },
}));
