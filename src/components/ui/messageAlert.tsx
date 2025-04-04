'use client'

import { messageType, messageTypeEnum } from '@/types';
import Image from 'next/image'
import Link from 'next/link';

type MessageAlertProps = {
  message?: messageType;
}

export default function MessageAlert({ message }: MessageAlertProps) {
  return (
    <div className="flex flex-col bg-blue-600 text-white rounded-t-lg">
      {message?.type == messageTypeEnum.INFO && (
        <div className="bg-blue-700 px-4 py-2 text-sm text-center">
          {message.text}
        </div>
      )}

      {message?.type == messageTypeEnum.ERROR && (
        <div className="bg-red-700 px-4 py-2 text-sm text-center">
          {message.text}
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