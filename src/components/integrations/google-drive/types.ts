export interface GoogleDriveExportProps {
  projectId: string;
  className?: string;
}

export interface ExportRecord {
  created_at: string;
  id: string
  file_link: string
  project_id: string
}

export type ExportStatus = 'idle' | 'loading' | 'success' | 'error'; 