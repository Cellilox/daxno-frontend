export interface GoogleDriveExportProps {
  projectId: string;
  className?: string;
}

export interface ExportRecord {
  id: string;
  fileLink: string;
  exportDate: string;
  fileName: string;
}

export type ExportStatus = 'idle' | 'loading' | 'success' | 'error'; 