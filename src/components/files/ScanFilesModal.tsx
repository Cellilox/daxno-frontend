'use client'

import { useState } from 'react'
import FormModal from '../ui/Popup'
import MyDropzone from './Dropzone'
import { messageType, messageTypeEnum } from '@/types'
import { Upload } from 'lucide-react'

type ScanFilesModalProps = {
  projectId: string
  linkOwner: string
  plan: string
}

export default function ScanFilesModal({ linkOwner, projectId, plan }: ScanFilesModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState<messageType>({
    type: messageTypeEnum.NONE,
    text: ''
  })

  const handleClose = () => {
    setIsVisible(false);
    setMessage({
      type: messageTypeEnum.NONE,
      text: ''
    });
  };

  return (
    <>
      <button
        onClick={() => setIsVisible(true)}
        className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
      >
        <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
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
        size='small'
      >
        <div className="flex flex-col">
          <MyDropzone
            linkOwner={linkOwner}
            projectId={projectId}
            setIsVisible={setIsVisible}
            onMessageChange={setMessage}
            plan={plan}
          />
        </div>
      </FormModal>
    </>
  );
} 