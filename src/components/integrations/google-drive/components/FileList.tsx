import React from 'react';
import { FileItem } from './FileItem';

interface File {
  id: string;
  name: string;
  isFolder: boolean;
}

interface FileListProps {
  files: File[];
  onFileClick: (file: File) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onFileClick }) => (
  <div className="space-y-1">
    {files.map((file) => (
      <FileItem
        key={file.id}
        name={file.name}
        isFolder={file.isFolder}
        onClick={() => onFileClick(file)}
      />
    ))}
  </div>
); 