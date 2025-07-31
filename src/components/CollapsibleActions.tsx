'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Users, Mail, Share2 } from 'lucide-react';
import ScanFilesModal from './files/ScanFilesModal';
import IntegrationsModal from '@/components/integrations';
import FormModal from './ui/Popup';
import CreateInvite from './forms/CreateInvite';
import { Field, Record } from './spreadsheet/types';
import Address from './Address';
import ShareableLink from './ShareableLink';
import { Model, Project } from '@/types';
import ModelSelector from './Models';
import InsightsAndChat from './chat';
import { Message } from "@/components/chat/types"



interface CollapsibleActionsProps {
  projectId: string;
  project: Project
  shareableLink: string;
  isLinkActive: boolean;
  address: string;
  plan: string;
  is_project_owner: boolean;
  linkOwner: string;
  fields: Field[]
  records: Record[]
  freeModels: Model[]
  paidModels: Model[]
  tenantModal: string;
  chats: Message[]
}

export default function CollapsibleActions({ projectId, project, shareableLink, isLinkActive, address, plan, is_project_owner, linkOwner, fields, records, freeModels, paidModels, tenantModal, chats}: CollapsibleActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInvitePopupVisible, setIsInvitePopupVisible] = useState<boolean>(false)
  const [isAddressPopupVisible, setIsAddressPopupVisible] = useState<boolean>(false)
  const [isShareLinkPopupVisible, setIsShareLinkPopupVisible] = useState<boolean>(false)

  const handleShowInvitePopup = () => {
     setIsInvitePopupVisible(true)
  }

  const handleShowAddressPopup = () => {
    setIsAddressPopupVisible(true)
  }

  const handleShowShareLinkPopup = () => {
    setIsShareLinkPopupVisible(true)
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

              {is_project_owner && 
              
              <button onClick={handleShowShareLinkPopup} className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Shareable Link
              </button>
              
             }
              <div>
              <button onClick={handleShowAddressPopup} className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Mail Attachments
              </button>
            </div>
            </div>

            {/* Right Action Group */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-center sm:justify-end">
              <ModelSelector models={freeModels} tenantModal={tenantModal}/>

              <div className="flex items-center gap-2 flex-shrink-0">
                <InsightsAndChat 
                  projectId={projectId}
                  widthClassName="lg:w-11/12"
                  chats={chats}
                />
              </div>
              {is_project_owner && (
              <div>
              <button onClick={handleShowInvitePopup} className="text-xs sm:text-sm inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Invite
              </button>
            </div>)
              }
              <div className="flex items-center gap-2 flex-shrink-0">
                <IntegrationsModal 
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
          title="Send Invite"
          onCancel={() => setIsInvitePopupVisible(false)}
          position="center"
          size="small"
        >
          <div className='flex justify-between'>
          <CreateInvite projectId={projectId} setIsInvitePopupVisible={setIsInvitePopupVisible}/>
          </div>
        </FormModal>
      )}

       {/* Generate Address Popup */}
       {isAddressPopupVisible && (
        <FormModal
          visible={isAddressPopupVisible}
          onCancel={() => setIsAddressPopupVisible(false)}
          position="center"
          size="small"
          isHeaderHidden={true}
        >
          <div className='flex justify-between'>
          <Address  address={address} setIsAddressPopupVisible={setIsAddressPopupVisible}/>
          </div>
        </FormModal>
      )} 

        {/* Generate ShareLink Popup */}
       {isShareLinkPopupVisible && (
        <FormModal
          visible={isShareLinkPopupVisible}
          onCancel={() => setIsShareLinkPopupVisible(false)}
          position="center"
          size="small"
          isHeaderHidden={true}
        >
          <div className='flex justify-between'>
          <ShareableLink shareableLink={shareableLink} isLinkActive={isLinkActive} projectId={projectId} project={project} setIsShareLinkPopupVisible={setIsShareLinkPopupVisible}/>
          </div>
        </FormModal>
      )} 
    </div>
  );
} 