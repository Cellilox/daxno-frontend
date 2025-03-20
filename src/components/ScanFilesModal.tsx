'use client'

import { useState } from 'react'
import FormModal from './ui/Popup'
import MyDropzone from './Dropzone'

type ScanFilesModalProps = {
  projectId: string
  linkOwner: string
}

export default function ScanFilesModal({ linkOwner, projectId }: ScanFilesModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState('')

  const handleClose = () => {
    setIsVisible(false);
    setMessage('');

  };

  return (
    <>
      <button
        onClick={() => setIsVisible(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
      >
        Scan Files
      </button>

      <FormModal
        visible={isVisible}
        title="Scan Your Files"
        message={message}
        onSubmit={async (e) => {
          e.preventDefault();
        }}
        onCancel={handleClose}
        position="center"
      >
        <div className="flex flex-col">
          <MyDropzone
            linkOwner={linkOwner}
            projectId={projectId}
            setIsVisible={setIsVisible}
            onMessageChange={setMessage}
          />
        </div>
      </FormModal>
    </>
  );
} 