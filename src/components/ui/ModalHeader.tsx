'use client'

import { messageType, messageTypeEnum } from '@/types';
import Image from 'next/image'
import MessageAlert from './messageAlert';

type ModalHeaderProps = {
  title?: string;
  isHeaderHidden?: boolean;
  onClose: () => void;
  message?: messageType;
}

export default function ModalHeader({ title, onClose, message, isHeaderHidden }: ModalHeaderProps) {
  return (
    <>
    {!isHeaderHidden && (
      <div className="flex flex-col bg-blue-600 text-white rounded-t-lg">
      <div className="flex justify-between items-center px-4 py-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 rounded hover:bg-blue-700 transition"
          aria-label="Close modal"
        >
          <Image src="/close.svg" alt="Close" width={24} height={24} />
        </button>
      </div>
    
      {message && (
        <MessageAlert message={message}/>
      )}
     
    </div>
    )}
    </>
  );
} 