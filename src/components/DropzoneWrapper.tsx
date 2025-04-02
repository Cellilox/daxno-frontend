'use client'; // This makes it a client component

import MyDropzone from "@/components/Dropzone";
import { useState } from "react";
import FormModal from "@/components/ui/Popup"; // Import the FormModal component

type DropzoneWrapperProps = {
  projectId: string;
  linkOwner: string
};

export default function DropzoneWrapper({ projectId, linkOwner }: DropzoneWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      <button 
        onClick={() => setIsVisible(true)} 
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Upload File
      </button>

      <FormModal 
        visible={isVisible} 
        title="Upload Your File" 
        onCancel={() => setIsVisible(false)}
      >

        <MyDropzone
          projectId={projectId} 
          linkOwner={linkOwner}
          setIsVisible={setIsVisible} 
          onMessageChange={setMessage} 
        />


        {message && (
          <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-md">
            <p className="text-blue-600">{message}</p>
          </div>
        )}
      </FormModal>
    </>
  );
} 