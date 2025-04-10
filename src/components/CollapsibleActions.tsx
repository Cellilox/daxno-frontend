'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Share2, Trash2, Download, Upload, Database, MessageSquare } from 'lucide-react';
import ScanFilesModal from './files/ScanFilesModal';
import GenerateLinkOverlay from './GenerateLinkOverlay';
import ScanView from './files/ScanView';
import Integrations from './integrations/Integrations';
import FormModal from './ui/Popup';
import RecordChat from './RecordChat';

type CollapsibleActionsProps = {
  projectId: string;
  linkOwner: string;
};

export default function CollapsibleActions({ projectId, linkOwner }: CollapsibleActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full sm:hidden flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors mb-4"
      >
        {isExpanded ? (
          <>
            Hide Actions
            <ChevronUp size={16} />
          </>
        ) : (
          <>
            Show Actions
            <ChevronDown size={16} />
          </>
        )}
      </button>

      <div className={`${!isExpanded && 'hidden sm:block'}`}>
        <div className="flex flex-col gap-4">
          {/* Action Group */}
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center sm:justify-between w-full">
            <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-center sm:justify-start">
              {/* <button className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 flex-shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Undo
              </button> */}
              <ScanFilesModal
                linkOwner={linkOwner}
                projectId={projectId}
              />
              <GenerateLinkOverlay />
            </div>

            {/* Right Action Group */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-center sm:justify-end">
            {/* <button 
                onClick={() => setIsChatOpen(true)}
                className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 flex-shrink-0"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Chat with documents
              </button> */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <ScanView />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Integrations projectId={projectId}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Popup */}
      {isChatOpen && (
        <FormModal
          visible={isChatOpen}
          title="Chat with AI"
          onCancel={() => setIsChatOpen(false)}
          position="center"
        >
          <RecordChat projectId={projectId} filename="" />
        </FormModal>
      )}
    </div>
  );
} 