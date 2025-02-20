'use client'

import { useState } from 'react'
import FormModal from './ui/Popup'
import MyDropzone from './Dropzone'

type ScanFilesModalProps = {
  user_id: string | undefined
  sessionId: string | undefined
  projectId: string
  token: string | null
  onClose: () => void
  onOk: () => void
}

export default function ScanFilesModal({ user_id, sessionId, projectId, token, onClose, onOk }: ScanFilesModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState('')

  const handleClose = () => {
    setIsVisible(false);
    setMessage('');
    onClose();
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
          await onOk();
        }}
        onCancel={handleClose}
        position="center"
      >
        <div className="flex flex-col">
          <MyDropzone
            user_id={user_id}
            sessionId={sessionId}
            projectId={projectId}
            token={token}
            onClose={handleClose}
            onMessageChange={setMessage}
          />
        </div>
      </FormModal>
    </>
  );
} 