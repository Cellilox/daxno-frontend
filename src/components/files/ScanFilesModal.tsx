'use client'

import { useState } from 'react'
import StandardPopup from '../ui/StandardPopup'
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
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow transition-all duration-200"
        >
          <Upload size={16} />
          <span className="text-sm font-medium">Scan Files</span>
        </button>
      )}

      <StandardPopup
        isOpen={isVisible}
        onClose={handleClose}
        title="Scan Your Files"
        subtitle="Upload documents or images for processing"
        icon={<Upload size={24} />}
        widthClassName="max-w-2xl"
      >
        <div className="flex flex-col">
          {message.text && (
            <div className={`mb-4 p-3 rounded-md text-sm ${message.type === messageTypeEnum.ERROR ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              <div className="flex justify-between items-center w-full">
                <span>{message.text}</span>
                {message.rightText && (
                  <span className="font-medium ml-2">{message.rightText}</span>
                )}
              </div>
            </div>
          )}
          <MyDropzone
            linkOwner={linkOwner}
            projectId={projectId}
            setIsVisible={setIsVisible}
            onMessageChange={setMessage}
            plan={plan}
          />
        </div>
      </StandardPopup>
    </>
  );
} 