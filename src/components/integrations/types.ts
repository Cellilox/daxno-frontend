// Integration-related types
export interface ExportRecord {
  fileLink: string;
  exportDate: string;
  fileName: string;
  id: string;
}

export type ExportStatus = 'idle' | 'loading' | 'success' | 'error'; 