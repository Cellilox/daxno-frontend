import { HubSpotExportType } from './types';

export const EXPORT_TYPES: HubSpotExportType[] = ['contacts', 'companies', 'deals', 'tickets'];

// ID properties for different object types in HubSpot
export const ID_PROPERTIES: Record<HubSpotExportType, string> = {
  contacts: 'email',      // Contacts are uniquely identified by email
  companies: 'domain',    // Companies are uniquely identified by domain
  deals: 'dealname',      // Deals are uniquely identified by dealname
  tickets: 'subject'      // Tickets are uniquely identified by subject
} as const;