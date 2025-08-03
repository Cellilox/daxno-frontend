'use client'

import { CopyIcon, CheckCircleIcon, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { regenerateProjectLink, updateProject } from "@/actions/project-actions";
import { Project } from "@/types";
import LoadingSpinner from "./ui/LoadingSpinner";

type ShareableLinkProps = {
  shareableLink: string;
  project: Project
  projectId: string;
  isLinkActive: boolean;
  setIsShareLinkPopupVisible: (value: boolean) => void;
};

export default function ShareableLink({ shareableLink, isLinkActive, projectId, project, setIsShareLinkPopupVisible }: ShareableLinkProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentLink, setCurrentLink] = useState(shareableLink);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  // Sync prop changes
  useEffect(() => {
    setCurrentLink(shareableLink);
  }, [shareableLink]);

  const copyToClipboardHandler = async () => {
    if (!isLinkActive) return;
    try {
      await navigator.clipboard.writeText(currentLink);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setIsShareLinkPopupVisible(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const regenerateProjectShareLink = async () => {
    const data = {
        ...project
    }

    setIsGeneratingLink(true)
    await regenerateProjectLink(projectId, data)
    setTimeout(()=> {
      setIsGeneratingLink(false)
      setSettingsOpen(false);
    }, 2500)
  };

  const deactivateLink = async () => {
    const data = {
        ...project,
        link_is_active: false
    }
    setLoading(true)
    await updateProject(projectId, data)
    setTimeout(() => {
      setLoading(false)
    setSettingsOpen(false);
    }, 2500)
  };

  return (
    <div className="relative p-4 bg-white rounded-lg shadow max-w-md mx-auto">
      {/* Desktop Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Share Link</h1>
        <div className="flex items-center gap-2 relative">
          {/* Settings Icon */}
          <button
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Toggle settings"
            onClick={() => setSettingsOpen(open => !open)}
          >
            <Settings />
          </button>
          {/* Settings Popup */}
          {settingsOpen && (
            <div className="absolute right-0 mt-6 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10 transition transform duration-200 ease-out popup-animation">
              <div className="py-2 flex flex-col">
                <div className="flex justify-end">
                <Image src="/close.svg" alt="Close" width={24} height={24} onClick={() => setSettingsOpen(false)}/>
                </div>
                <button
                  onClick={deactivateLink}
                  disabled={!isLinkActive}
                  className={`flex px-4 py-2 text-left text-sm font-medium rounded-md ${!isLinkActive ? 'text-gray-500 bg-gray-100 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                >
                  {loading && <LoadingSpinner className="mr-3 text-red-300"/>}
                  {!isLinkActive ? 'Link Deactivated' : 'Deactivate Link'}
                </button>
                <button
                  onClick={regenerateProjectShareLink}
                  className="flex mt-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {isGeneratingLink && <LoadingSpinner className="mr-3"/>}
                  Get new Link
                </button>
              </div>
            </div>
          )}
          {/* Close Icon */}
          <button
            onClick={() => setIsShareLinkPopupVisible(false)}
            className="p-2 rounded"
            aria-label="Close modal"
          >
            <Image src="/close.svg" alt="Close" width={24} height={24} />
          </button>
        </div>
      </div>

      <>
        {/* Instructions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <p className="text-gray-700">Click the box below to copy your link.</p>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <p className="text-gray-700">Use settings (⚙️) to deactivate or regenerate a new link.</p>
          </div>
        </div>

        {/* Copyable Link */}
        <button
          onClick={copyToClipboardHandler}
          disabled={!isLinkActive}
          className={`w-full flex items-center justify-between p-3 transition rounded-md overflow-x-auto break-all ${
            !isLinkActive 
              ? 'bg-gray-100 cursor-not-allowed' 
              : 'bg-blue-50 hover:bg-blue-100'
          }`}
        >
          {copySuccess ? (
            <>
              <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-700 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <span className={`text-sm font-mono mr-2 break-all ${
                !isLinkActive ? 'text-gray-500 line-through' : 'text-blue-700'
              }`}>
                {currentLink}
              </span>
              <CopyIcon className={`w-4 h-4 ${
                !isLinkActive ? 'text-gray-500' : 'text-blue-700'
              }`} />
            </>
          )}
        </button>
      </>

      {/* Popup Animation Styles */}
      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .popup-animation {
          animation: slideDown 200ms ease-out forwards;
        }
      `}</style>
    </div>
  );
}
