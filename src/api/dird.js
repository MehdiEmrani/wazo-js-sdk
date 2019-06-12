/* @flow */
import ApiRequester from '../utils/api-requester';
import type { UUID, Token } from '../domain/types';
import Contact from '../domain/Contact';
import type { NewContact } from '../domain/Contact';
import type { DirectorySource, DirectorySources } from '../domain/DirectorySource';
import type { Sources } from '../index';

const getContactPayload = (contact: NewContact | Contact) => ({
  email: contact.email,
  firstname: contact.firstName ? contact.firstName : '',
  lastname: contact.lastName ? contact.lastName : '',
  number: contact.phoneNumber ? contact.phoneNumber : '',
  entreprise: contact.entreprise ? contact.entreprise : '',
  birthday: contact.birthday ? contact.birthday : '',
  address: contact.address ? contact.address : '',
  note: contact.note ? contact.note : '',
});

type ContactSearchQueryParams = {
  order?: string,
  direction?: 'asc' | 'desc',
  limit?: number,
  offset?: number,
  search?: string,
} | null;

export default (client: ApiRequester, baseUrl: string) => ({
  search(token: Token, context: string, term: string): Promise<Array<Contact>> {
    return client
      .get(`${baseUrl}/directories/lookup/${context}`, { term }, token)
      .then(response => Contact.parseMany(response));
  },

  listPersonalContacts(token: Token, queryParams: ContactSearchQueryParams = null): Promise<Array<Contact>> {
    return client
      .get(`${baseUrl}/personal`, queryParams, token)
      .then(response => Contact.parseManyPersonal(response.items));
  },

  addContact(token: Token, contact: NewContact): Promise<Contact> {
    return client
      .post(`${baseUrl}/personal`, getContactPayload(contact), token)
      .then(response => Contact.parsePersonal(response));
  },

  editContact(token: Token, contact: Contact): Promise<Contact> {
    return client
      .put(`${baseUrl}/personal/${contact.sourceId || contact.id || ''}`, getContactPayload(contact), token)
      .then(response => Contact.parsePersonal(response));
  },

  deleteContact(token: Token, contactUuid: UUID) {
    return client.delete(`${baseUrl}/personal/${contactUuid}`, null, token);
  },

  listFavorites(token: Token, context: string): Promise<Array<Contact>> {
    return client
      .get(`${baseUrl}/directories/favorites/${context}`, null, token)
      .then(response => Contact.parseMany(response));
  },

  markAsFavorite(token: Token, source: string, sourceId: string): Promise<Boolean> {
    const url = `${baseUrl}/directories/favorites/${source}/${sourceId}`;

    return client.put(url, null, token, ApiRequester.successResponseParser);
  },

  removeFavorite(token: Token, source: string, sourceId: string) {
    return client.delete(`${baseUrl}/directories/favorites/${source}/${sourceId}`, null, token);
  },

  fetchOffice365Source(token: Token, context: string): Promise<DirectorySources> {
    return client
      .get(`${baseUrl}/directories/${context}/sources`, { backend: 'office365' }, token)
      .then(response => response);
  },

  fetchOffice365Contacts(
    token: Token,
    source: DirectorySource,
    queryParams: ContactSearchQueryParams = null,
  ): Promise<Contact[]> {
    return client
      .get(`${baseUrl}/backends/office365/sources/${source.uuid}/contacts`, queryParams, token)
      .then(response => Contact.parseManyOffice365(response.items, source));
  },

  fetchWazoSource(token: Token, context: string): Promise<Sources> {
    return client
      .get(`${baseUrl}/directories/${context}/sources`, { backend: 'wazo' }, token)
      .then(response => response);
  },

  fetchWazoContacts(
    token: Token,
    source: DirectorySource,
    queryParams: ContactSearchQueryParams = null,
  ): Promise<Contact[]> {
    return client
      .get(`${baseUrl}/backends/wazo/sources/${source.uuid}/contacts`, queryParams, token)
      .then(response => Contact.parseManyWazo(response.items, source));
  },

  fetchGoogleSource(token: Token, context: string): Promise<Sources> {
    return client
      .get(`${baseUrl}/directories/${context}/sources`, { backend: 'google' }, token)
      .then(response => response);
  },

  fetchGoogleContacts(
    token: Token,
    source: DirectorySource,
    queryParams: ContactSearchQueryParams = null,
  ): Promise<Contact[]> {
    return client
      .get(`${baseUrl}/backends/google/sources/${source.uuid}/contacts`, queryParams, token)
      .then(response => Contact.parseManyGoogle(response.items, source));
  },

  fetchConferenceSource(token: Token, context: string): Promise<Sources> {
    return client
      .get(`${baseUrl}/directories/${context}/sources`, { backend: 'conference' }, token)
      .then(response => response);
  },

  fetchConferenceContacts(token: Token, source: DirectorySource): Promise<Contact[]> {
    return client
      .get(`${baseUrl}/backends/conference/sources/${source.uuid}/contacts`, null, token)
      .then(response => Contact.parseManyConference(response.items, source));
  },
});
