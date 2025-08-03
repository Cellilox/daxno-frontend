"use server"
import { fetchAuthed, fetchAuthedJson } from "@/lib/api-client";
export type HubSpotExportType = 'contacts' | 'companies' | 'deals'; 

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
    const response = await fetchAuthed(`${process.env.NEXT_PUBLIC_API_URL}/export/hubspot/properties?object_type=${object_type}`);
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
    const response = await fetchAuthedJson(
      `${process.env.NEXT_PUBLIC_API_URL}/export/hubspot/${type}/batch-upsert`,
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
    const response = await fetchAuthedJson(`${process.env.NEXT_PUBLIC_API_URL}/export/hubspot/disconnect`, {
      method: 'DELETE'
    });
  
    if (!response.ok) {
      throw new Error('Failed to disconnect HubSpot');
    }
  } catch (error) {
    console.log(error)
  }
}
