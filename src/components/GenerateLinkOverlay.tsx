'use client'; 

import { useState } from "react";
import { usePathname } from "next/navigation";
import AlertDialog from "./ui/AlertDialog"; 
import { generateLink } from "@/actions/submission-actions";
import { Share2 } from "lucide-react";
import { messageTypeEnum } from "@/types";

type GenerateLinkProps = {
  plan: string
}
export default function GenerateLinkOverlay({plan}: GenerateLinkProps) {
  const pathname = usePathname();
  const projectId = pathname.split('/')[2];
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [link, setLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const copyToClipboardHandler = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleGenerateLink = async (proj_id: string, plan: string) => {
    try {
      setIsLoading(true);
      const response = await generateLink(proj_id, plan);
      setLink(response.url);
    } catch (error) {
      console.error('Error generating link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDialog = () => {
    setDialogVisible(true);
    handleGenerateLink(projectId, plan);
  }

  const notification = {
    type: messageTypeEnum.REQUEST_TO_UPGRADE,
    text: 'This feature is not allowed for your current plan'
  }

  return (
    <>
      <button
        onClick={toggleDialog}
        className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
      >
        <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
        Generate Link
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
        isLoading={isLoading}
        showLinkIcon
        centerContent
        //notification={notification}
      />
    </>
  );
} 