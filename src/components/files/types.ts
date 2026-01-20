// File-related types
export type FileStatus = {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'extracting' | 'analyzing' | 'analyzed' | 'saving' | 'complete' | 'error';
  error?: string;
  result?: any;
}; 