import React, { useState } from 'react';
import { FileList } from './FileList';

interface File {
  id: string;
  name: string;
  isFolder: boolean;
}

interface FilePickerProps {
  onFileSelect: (file: File) => void;
  onClose: () => void;
}

export const FilePicker: React.FC<FilePickerProps> = ({ onFileSelect, onClose }) => {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileClick = async (file: File) => {
    if (file.isFolder) {
      setCurrentFolder(file.id);
      setLoading(true);
      try {
        // TODO: Fetch files from the selected folder
        const response = await fetch(`/api/google-drive/folders/${file.id}`);
        const data = await response.json();
        setFiles(data.files);
      } catch (error) {
        console.error('Error fetching folder contents:', error);
      } finally {
        setLoading(false);
      }
    } else {
      onFileSelect(file);
    }
  };

  const handleBack = () => {
    setCurrentFolder(null);
    // TODO: Fetch files from the parent folder
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Select a file</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      <div className="mb-4">
        {currentFolder && (
          <button
            onClick={handleBack}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <FileList files={files} onFileClick={handleFileClick} />
      )}
    </div>
  );
}; 