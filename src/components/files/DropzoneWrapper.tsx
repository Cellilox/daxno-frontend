'use client'; // This makes it a client component

import MyDropzone from "./Dropzone";
import { useState } from "react";
import FormModal from "../ui/Popup"; // Import the FormModal component
import { messageType } from "@/types";

type DropzoneWrapperProps = {
  projectId: string;
  linkOwner: string;
  plan: string;
};


export default function DropzoneWrapper({ projectId, linkOwner, plan }: DropzoneWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState<messageType>({
    type: '', text: ''
  });

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
        position="center"
        size="small"
        message={message}
      >

        <MyDropzone
          projectId={projectId}
          linkOwner={linkOwner}
          setIsVisible={setIsVisible}
          onMessageChange={setMessage}
          plan={plan}
        />

      </FormModal>
    </>
  );
} 