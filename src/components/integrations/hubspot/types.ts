export interface PropertyMapping {
  ourProperty: string;
  hubspotProperty: string;
  isRequired?: boolean;
  isHubspotField?: boolean;
  defaultValue?: string;
}

export interface HubSpotExportProps {
  projectId: string;
  className?: string;
  fields: {
    id: string;
    name: string;
    type: string;
  }[];
  records: {
    id: string;
    answers: {
      [key: string]: string;
    };
    filename: string;
    file_key: string;
    project_id: string;
    created_at: string;
    updated_at: string;
  }[];
}

export interface ExportStatus {
  isLoading: boolean;
  isConnected: boolean;
  success: boolean;
  error: string | null;
  lastExportDate: string | null;
}

export type HubSpotExportType = 'contacts' | 'companies' | 'deals' | 'tickets'; 