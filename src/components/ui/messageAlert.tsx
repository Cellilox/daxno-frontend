'use client'

import { messageType, messageTypeEnum } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

type MessageAlertProps = {
  message?: messageType;
  onClose?: () => void
}

export default function MessageAlert({ message, onClose }: MessageAlertProps) {
  return (
    <div className="flex flex-col text-white rounded-t-lg">
      {message?.type == messageTypeEnum.INFO && (
        <div className="bg-blue-700 px-4 py-2 flex justify-between items-center">
          <p className="text-sm">{message.text}</p>
        </div>
      )}


      {message?.type == messageTypeEnum.SUCCESS && (
        <div className="bg-green-600 px-4 py-2 flex justify-between items-center">
          <p className="text-sm">{message.text}</p>
          <button
          onClick={onClose}
          className="p-2 rounded hover:bg-red-200 transition"
          aria-label="Close modal"
        >
          <Image src="/close.svg" alt="Close" width={24} height={24} />
        </button>
        </div>
      )}

      {message?.type == messageTypeEnum.ERROR && (
        <div className="bg-red-500 px-4 py-2 flex justify-between items-center">
          <p className="text-sm">{message.text}</p>
          <button
          onClick={onClose}
          className="p-2 rounded hover:bg-red-200 transition"
          aria-label="Close modal"
        >
          <Image src="/close.svg" alt="Close" width={24} height={24} />
        </button>
        </div>
      )}

      {message?.type == messageTypeEnum.REQUEST_TO_UPGRADE&& (
        <div className="bg-yellow-700 px-4 py-2 text-sm text-center">
          {message.text}
          <Link href='/pricing' className='ml-4 underline'>Upgrade to Pro</Link>
        </div>
      )}

      {message?.type == messageTypeEnum.SUGGEST_TO_UPGRADE&& (
        <div className="bg-yellow-700 px-4 py-2 text-sm text-center">
          {message.text}
          <Link href='/pricing' className='underline'>Upgrade to Pro</Link> <p>or</p>
          <button className="ml-4">Continue with Basic</button>
        </div>
      )}
    </div>
  );
} 