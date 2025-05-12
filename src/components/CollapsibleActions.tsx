'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Share2, Trash2, Download, Upload, Database, MessageSquare, Users } from 'lucide-react';
import ScanFilesModal from './files/ScanFilesModal';
import GenerateLinkOverlay from './GenerateLinkOverlay';
import ScanView from './files/ScanView';
import Integrations from './integrations/Integrations';
import FormModal from './ui/Popup';
import CreateInvite from './forms/CreateInvite';

interface CollapsibleActionsProps {
  projectId: string;
  plan: string;
  is_project_owner: boolean;
  linkOwner: string;
  fields: {
    id: string;
    name: string;
    type: string;
  }[];
  records: {
    id: string;
    answers: {
      [key: string]: string;
    };
    filename: string;
    file_key: string;
    project_id: string;
    created_at: string;
    updated_at: string;
  }[];
}

export default function CollapsibleActions({ projectId, plan, is_project_owner, linkOwner, fields, records }: CollapsibleActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInvitePopupVisible, setIsInvitePopupVisible] = useState<boolean>(false)

  const handleShowInvitePopup = () => {
     setIsInvitePopupVisible(true)
  }

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
              <ScanFilesModal
                linkOwner={linkOwner}
                projectId={projectId}
                plan={plan}
              />

              {is_project_owner && <GenerateLinkOverlay plan={plan} />}
            </div>

            {/* Right Action Group */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-center sm:justify-end">
              {/* <div className="flex items-center gap-2 flex-shrink-0">
                <ScanView />
              </div>  */}
        
              {is_project_owner && (
              <div>
              <button onClick={handleShowInvitePopup} className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Invite
              </button>
            </div>)
              }
              <div className="flex items-center gap-2 flex-shrink-0">
                <Integrations 
                  projectId={projectId} 
                  fields={fields} 
                  records={records}
                />
              </div>
            </div>
          </div>
        </div>
      </div>


       {/* Invite Popup */}
       {isInvitePopupVisible && (
        <FormModal
          visible={isInvitePopupVisible}
          title="Send Invite to this Project"
          onCancel={() => setIsInvitePopupVisible(false)}
          position="center"
          size="small"
        >
          <div className='flex justify-between'>
          <CreateInvite projectId={projectId} setIsInvitePopupVisible={setIsInvitePopupVisible}/>
          </div>
        </FormModal>
      )}
    </div>
  );
} 