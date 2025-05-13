import React from 'react'
import MessageAlert from './messageAlert'
import { messageType} from '@/types';


type AlertProps = {
        message: messageType,
        onClose: () => void
}
export default function Alert({message, onClose}: AlertProps) {
  return (
    <div className="z-50 fixed inset-0 top-0 flex justify-center h-20">
    <div className="w-full lg:w-1/2">
    <MessageAlert message={message} onClose={onClose}/>
    </div>
    </div>
  )
}
