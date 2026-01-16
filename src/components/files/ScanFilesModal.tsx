'use client'

import { useState } from 'react'
import FormModal from '../ui/Popup'
import MyDropzone from './Dropzone'
import { messageType, messageTypeEnum } from '@/types'
import { Upload } from 'lucide-react'

type ScanFilesModalProps = {
  projectId: string
  linkOwner: string
  plan: string;
  // Optional controlled mode
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ScanFilesModal({ linkOwner, projectId, plan, isOpen: externalIsOpen, onClose: externalOnClose }: ScanFilesModalProps) {
  const [internalIsVisible, setInternalIsVisible] = useState(false)

  // Use external state if provided, otherwise use internal
  const isVisible = externalIsOpen !== undefined ? externalIsOpen : internalIsVisible;
  const setIsVisible = externalOnClose !== undefined ? externalOnClose : setInternalIsVisible;

  const [message, setMessage] = useState<messageType>({
    type: messageTypeEnum.NONE,
    text: ''
  })

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsVisible(false);
    }
    setMessage({
      type: messageTypeEnum.NONE,
      text: ''
    });
  };

  const handleOpen = () => {
    if (externalIsOpen === undefined) {
      setInternalIsVisible(true);
    }
  };

  return (
    <>
      {/* Only show button in uncontrolled mode */}
      {externalIsOpen === undefined && (
        <button
          onClick={handleOpen}
          className="text-base inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
        >
          <Upload className="w-5 h-5 mr-3 flex-shrink-0" />
          Scan Files
        </button>
      )}

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