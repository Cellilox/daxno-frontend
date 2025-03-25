'use client'; 

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AlertDialog from "./ui/AlertDialog"; 
import { generateLink } from "@/actions/submission-actions";

export default function GenerateLinkOverlay() {
  const pathname = usePathname();
  const projectId = pathname.split('/')[2];
  console.log("proj", projectId)
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [link, setLink] = useState("");

  const copyToClipboardHandler = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleGenerateLink = async (proj_id: string) => {
    try {
      const response = await generateLink(proj_id);
      console.log({response})
      setLink(response.url);
    } catch (error) {
      console.error('Error generating link:', error);
    }
  };

 const toggleDialog =() => {
  setDialogVisible(true);
  handleGenerateLink(projectId)
 }

  return (
    <>
      <button 
        onClick={toggleDialog} 
        className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
      >
        Share Link
      </button>

      <AlertDialog
        visible={isDialogVisible}
        title="Share Link"
        message={link}
        confirmText="Copy"
        cancelText="Close"
        onConfirm={copyToClipboardHandler}
        onCancel={() => setDialogVisible(false)}
        copiedMessage={copySuccess ? "Link copied!" : ""}
      />
    </>
  );
} 