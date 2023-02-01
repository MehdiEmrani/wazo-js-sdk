import ApiRequester from '../utils/api-requester';
import type { UUID } from '../domain/types';
import Contact from '../domain/Contact';
import type { NewContact } from '../domain/Contact';
import type { DirectorySource, DirectorySources } from '../domain/DirectorySource';
import type { Sources } from '../index';
export interface DirD {
    search: (context: string, term: string) => Promise<Array<Contact>>;
    listPersonalContacts: (queryParams?: ContactSearchQueryParams) => Promise<Array<Contact>>;
    fetchPersonalContact: (contactUuid: string) => Promise<Contact>;
    addContact: (contact: NewContact) => Promise<Contact>;
    editContact: (contact: Contact) => Promise<Contact>;
    importContacts: (csv: string) => Promise<Contact[]>;
    deleteContact: (contactUuid: UUID) => void;
    listFavorites: (context: string) => Promise<Array<Contact>>;
    markAsFavorite: (source: string, sourceId: string) => Promise<boolean>;
    removeFavorite: (source: string, sourceId: string) => Promise<void>;
    fetchOffice365Source: (context: string) => Promise<DirectorySources>;
    fetchOffice365Contacts: (source: DirectorySource, queryParams: ContactSearchQueryParams) => Promise<Contact[]> | null | undefined;
    fetchWazoSource: (context: string) => Promise<Sources>;
    fetchWazoContacts: (source: DirectorySource, queryParams: ContactSearchQueryParams) => Promise<Contact[]> | null | undefined;
    fetchGoogleSource: (context: string) => Promise<Sources>;
    fetchGoogleContacts: (source: DirectorySource, queryParams: ContactSearchQueryParams) => Promise<Contact[]> | null | undefined;
    fetchConferenceSource: (context: string) => Promise<Sources>;
    fetchConferenceContacts: (source: DirectorySource) => Promise<Contact[]> | null | undefined;
    findMultipleContactsByNumber: (numbers: string[], fields?: Record<string, any>) => Promise<Contact[]>;
}
type ContactSearchQueryParams = {
    order?: string;
    direction?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    search?: string;
    uuid?: string;
} | null;
declare const _default: (client: ApiRequester, baseUrl: string) => DirD;
export default _default;
//# sourceMappingURL=dird.d.ts.map