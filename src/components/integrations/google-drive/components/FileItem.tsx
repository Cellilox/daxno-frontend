import React from 'react';
import { FileIcon } from './FileIcon';
import { FolderIcon } from './FolderIcon';

interface FileItemProps {
  name: string;
  isFolder: boolean;
  onClick: () => void;
}

export const FileItem: React.FC<FileItemProps> = ({ name, isFolder, onClick }) => (
  <div
    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
    onClick={onClick}
  >
    {isFolder ? <FolderIcon /> : <FileIcon />}
    <span className="text-sm text-gray-700">{name}</span>
  </div>
); 