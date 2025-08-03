'use client'

import { CopyIcon, CheckCircleIcon } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

type CreateAddressProps = {
  address: string;
  setIsAddressPopupVisible: (value: boolean) => void;
}

export default function CreateAddress({ address, setIsAddressPopupVisible }: CreateAddressProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboardHandler = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setIsAddressPopupVisible(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="relative p-4 bg-white rounded-lg shadow max-w-md mx-auto">
    {/* Desktop/Tablet Header */}
    <div className="hidden sm:flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-left text-gray-800">
        Your Address Domain is Ready!
      </h1>
      <button
        onClick={() => setIsAddressPopupVisible(false)}
        className="p-2 rounded"
        aria-label="Close modal"
      >
        <Image src="/close.svg" alt="Close" width={24} height={24} />
      </button>
    </div>

    {/* Mobile Header */}
    <div className="flex sm:hidden justify-center items-center mb-6">
      <h1 className="text-lg font-semibold text-center text-gray-800">
        Your Address is Ready!
      </h1>
    </div>

    {/* Mobile Close Button */}
    <button
      onClick={() => setIsAddressPopupVisible(false)}
      className="sm:hidden absolute top-4 right-4 p-2 rounded"
      aria-label="Close modal"
    >
      <Image src="/close.svg" alt="Close" width={24} height={24} />
    </button>

    <div className="space-y-4 mb-6">
      {[
        { icon: '1', bg: 'bg-blue-100', color: 'text-blue-600', text: (
          <>Forward any emails <strong>with attachments</strong> to your project’s email address: <span className="font-medium">{address}</span>.</>
        ) },
        { icon: '2', bg: 'bg-blue-100', color: 'text-blue-600', text: (
          <>Ask your clients or teammates to <strong>CC</strong> this email. Cellilox will automatically process all attachments, even when you're away.</>
        ) },
        { icon: '!', bg: 'bg-red-100', color: 'text-red-600', text: (
          <>Except for the project owner, no one should send emails directly to <strong>{address}</strong> unless they’ve <strong>CC'd</strong> the owner email.</>
        ) }

      ].map((step, idx) => (
        <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
          <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 ${step.bg} rounded-full flex items-center justify-center`}>  
            <span className={`${step.color} font-bold text-sm sm:text-base`}>{step.icon}</span>
          </div>
          <p className="text-gray-700 text-sm sm:text-base text-center sm:text-left">
            {step.text}
          </p>
        </div>
      ))}
    </div>

    <button
      onClick={copyToClipboardHandler}
      className="relative flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition p-3 rounded-md w-full"
    >
      {copySuccess ? (
        <>
          <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-700 font-medium">Copied!</span>
        </>
      ) : (
        <>
          <span className="text-blue-700 text-sm font-mono">{address}</span>
          <CopyIcon className="w-4 h-4 ml-2 text-blue-700" />
        </>
      )}
    </button>
  </div>
  );
}