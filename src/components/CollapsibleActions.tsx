'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Undo } from 'lucide-react';
import ScanFilesModal from './ScanFilesModal';
import GenOverlayWrapper from './GenOverlayWrapper';
import ScanView from './ScanView';
import Options from './Options';

type CollapsibleActionsProps = {
  projectId: string;
  linkOwner: string;
};

export default function CollapsibleActions({ projectId, linkOwner }: CollapsibleActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
              <button className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 flex-shrink-0">
                <Undo className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Undo
              </button>
              <ScanFilesModal
                linkOwner={linkOwner}
                projectId={projectId}
              />
              <GenOverlayWrapper />
            </div>

            {/* Right Action Group */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-center sm:justify-end">
              <div className="flex items-center gap-2 flex-shrink-0">
                <ScanView />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Options projectId={projectId}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 