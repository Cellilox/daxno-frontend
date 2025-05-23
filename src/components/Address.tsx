'use client'

import { CopyIcon, CheckCircleIcon } from "lucide-react";
import { useState } from "react";

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
    <div className="p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Your Address Domain is Ready!
      </h1>

      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold">1</span>
          </div>
          <p className="text-gray-700">
            Forward any emails <strong>with attachments</strong> to your project’s email address: <span className="font-medium">{address}</span>.
          </p>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold">2</span>
          </div>
          <p className="text-gray-700">
            Ask your clients or teammates to <strong>CC</strong> this email. Cellilox will automatically process all attachments, even when you're away.
          </p>
        </div>
      </div>

      {/* Copy button with inline feedback */}
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