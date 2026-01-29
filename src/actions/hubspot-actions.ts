"use server"
import { fetchAuthed, fetchAuthedJson, buildApiUrl } from "@/lib/api-client";
export type HubSpotExportType = 'contacts' | 'companies' | 'deals';

export const checkConnection = async (): Promise<boolean> => {
  try {
    const url = buildApiUrl('/export/hubspot/status');
    const response = await fetchAuthed(url);
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
    const url = buildApiUrl('/export/hubspot/auth');
    const response = await fetchAuthed(url);
    if (!response.ok) {
      throw new Error('Failed to get authorization URL');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error connecting to HubSpot:', error);
    throw new Error('Failed to connect to HubSpot');
  }
};

interface HubSpotProperty {
  name: string;
  label: string;
  fieldType: string;
}

interface HubSpotPropertiesResponse {
  export_type: HubSpotExportType;
  properties: HubSpotProperty[];
}

export const getHubSpotProperties = async (object_type: string): Promise<HubSpotPropertiesResponse> => {
  try {
    const url = buildApiUrl(`/export/hubspot/properties?object_type=${object_type}`);
    const response = await fetchAuthed(url);
    if (!response.ok) {
      throw new Error(`Failed to get ${object_type} properties for your account`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching HubSpot properties:', error);
    throw new Error('Failed to fetch HubSpot properties');
  }
};

export const exportToHubSpot = async (
  type: HubSpotExportType,
  mappedData: Record<string, any>[]
) => {
  const payload = {
    [type]: mappedData.map(record => ({
      id: record.id,
      id_property: record.id_property,
      properties: { ...record.properties }
    }))
  };

  try {
    const url = buildApiUrl(`/export/hubspot/${type}/batch-upsert`);
    const response = await fetchAuthedJson(
      url,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('HubSpot API Error Response:', errorData);
      throw new Error(`HubSpot API Error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error creating ${type}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to export to HubSpot: ${error}`);
  }
};

export async function DisconnectHubspot() {
  try {
    const url = buildApiUrl('/export/hubspot/disconnect');
    const response = await fetchAuthedJson(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect HubSpot');
    }
  } catch (error) {
    console.log(error)
  }
}
