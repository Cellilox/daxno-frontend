'use client'; 

import { useState } from "react";
import AlertDialog from "./ui/AlertDialog"; 

export default function GenerateLinkOverlay() {
  const generatedLink = "https://example.com/generated-link"; 
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboardHandler = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <>
      <button 
        onClick={() => setDialogVisible(true)} 
        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
      >
        Share Link
      </button>

      <AlertDialog
        visible={isDialogVisible}
        title="Share Link"
        message={generatedLink}
        confirmText="Copy"
        cancelText="Close"
        onConfirm={copyToClipboardHandler}
        onCancel={() => setDialogVisible(false)}
        copiedMessage={copySuccess ? "Link copied!" : ""}
      />
    </>
  );
} 