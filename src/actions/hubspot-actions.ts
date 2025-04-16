"use server"
import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";
export type HubSpotExportType = 'contacts' | 'companies' | 'deals' | 'tickets'; 

export const checkConnection = async (): Promise<boolean> => {
  try {
    const response = await fetchAuthed(`${process.env.NEXT_PUBLIC_API_URL}/export/hubspot/status`);
    if (!response.ok) {
      throw new Error('Failed to check connection status');
    }
    const data = await response.json();
    return data.connected;
  } catch (error) {
    console.error('Error checking HubSpot connection:', error);
    throw new Error('Failed to check HubSpot connection status');
  }
};

export const handleConnect = async (): Promise<void> => {
  try {
    const response = await fetchAuthed(`${process.env.NEXT_PUBLIC_API_URL}/export/hubspot/auth`);
    if (!response.ok) {
      throw new Error('Failed to get authorization URL');
    }
    const data = await response.json();
    console.log('DATA:', data)
    return data;
  } catch (error) {
    console.error('Error connecting to HubSpot:', error);
    throw new Error('Failed to connect to HubSpot');
  }
};


export const getHubSpotProperties = async (object_type: string): Promise<boolean> => {
    try {
      const response = await fetchAuthed(`${process.env.NEXT_PUBLIC_API_URL}/export/hubspot/properties?object_type=${object_type}`);
      if (!response.ok) {
        throw new Error(`Failed to get ${object_type} properties for your account`);
      }
      const data = await response.json();
      console.log('AVAILABLE_PROPERTIES', data);
      return data
    } catch (error) {
      console.error('Error checking HubSpot connection:', error);
      throw new Error('Failed to check HubSpot connection status');
    }
  };

export const exportToHubSpot = async (
  type: HubSpotExportType,
) => {
  const payload = {
    "contacts": [
      {
        "id": "kazadi@gmail.com",
        "id_property": "email",
        "properties": {
          "email": "kazadi@gmail.com",
          "firstname": "KazadiUUUow",
          "lastname": "mongot"
        }
      }
    ]
  }
  try {
    const response = await fetchAuthedJson(`${process.env.NEXT_PUBLIC_API_URL}/export/hubspot/contacts/batch-upsert`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    console.log('Response:', response);

    if (!response.ok) {
      throw new Error(`Failed to create ${type}`);
    }
    } catch (error) {
        console.error(`Error creating ${type}:`, error);
        throw error;
    }
}; 