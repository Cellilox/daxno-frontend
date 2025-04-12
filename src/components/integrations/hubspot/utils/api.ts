import { HubSpotExportType } from '../types';

export const checkConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/export/hubspot/status`);
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/export/hubspot/auth`);
    if (!response.ok) {
      throw new Error('Failed to get authorization URL');
    }
    const data = await response.json();
    
    const width = 600;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const popup = window.open(
      data.auth_url,
      'Connect to HubSpot',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    if (popup) {
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
        }
      }, 1000);
    }
  } catch (error) {
    console.error('Error connecting to HubSpot:', error);
    throw new Error('Failed to connect to HubSpot');
  }
};

export const exportToHubSpot = async (
  type: HubSpotExportType,
  projectId: string,
  records: any[]
): Promise<{ successCount: number; failureCount: number }> => {
  let successCount = 0;
  let failureCount = 0;

  const CHUNK_SIZE = 10;
  const chunks = [];
  for (let i = 0; i < records.length; i += CHUNK_SIZE) {
    chunks.push(records.slice(i, i + CHUNK_SIZE));
  }

  await Promise.all(chunks.map(async (chunk) => {
    const submissions = await Promise.allSettled(chunk.map(async (record) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/export/hubspot/${type}/${projectId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            properties: record
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to create ${type}`);
        }

        successCount++;
        return response.json();
      } catch (error) {
        failureCount++;
        console.error(`Error creating ${type}:`, error);
        throw error;
      }
    }));

    return submissions;
  }));

  return { successCount, failureCount };
}; 