'use client';

import { useState } from 'react';
import { Users, Mail, Share2, Upload } from 'lucide-react';
import ProjectActionsMenu from './ProjectActionsMenu';
import ScanFilesModal from './files/ScanFilesModal';
import FormModal from './ui/Popup';
import StandardPopup from './ui/StandardPopup';
import CreateInvite from './forms/CreateInvite';
import { Field, DocumentRecord } from './spreadsheet/types';
import Address from './Address';
import ShareableLink from './ShareableLink';
import { Model, Project } from '@/types';
import ModelSelector from './Models';
import OnyxDeepLinkButton from './OnyxDeepLinkButton';
import { Message } from "./chat/types"
import Integrations from './integrations/Integrations';


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
  records: DocumentRecord[]
  models: Model[]
  tenantModal: string;
  chats: Message[]
}

export default function CollapsibleActions({
  projectId,
  project,
  shareableLink,
  isLinkActive,
  address,
  plan,
  is_project_owner,
  linkOwner,
  fields,
  records,
  models,
  tenantModal
}: CollapsibleActionsProps) {
  const [isInvitePopupVisible, setIsInvitePopupVisible] = useState(false);
  const [isAddressPopupVisible, setIsAddressPopupVisible] = useState(false);
  const [isShareLinkPopupVisible, setIsShareLinkPopupVisible] = useState(false);

  return (
    <>
      {/* Mobile + Tablet: 3-dot menu */}
      <div className="md:hidden">
        <ProjectActionsMenu
          projectId={projectId}
          project={project}
          shareableLink={shareableLink}
          isLinkActive={isLinkActive}
          address={address}
          plan={plan}
          is_project_owner={is_project_owner}
          linkOwner={linkOwner}
          fields={fields}
          records={records}
          models={models}
          tenantModal={tenantModal}
        />
      </div>

      {/* Desktop: Full button layout */}
      <div className="hidden md:block w-full">
        <div className={`relative transition-all duration-300 ${fields.length === 0 ? 'blur-sm pointer-events-none select-none opacity-60' : ''}`}>
          <div className="flex flex-wrap gap-2 sm:gap-3 items-center justify-between w-full">
            <div className="flex flex-wrap gap-2 items-center">
              <ScanFilesModal
                linkOwner={linkOwner}
                projectId={projectId}
                plan={plan}
              />

              {is_project_owner && (
                <button
                  onClick={() => setIsShareLinkPopupVisible(true)}
                  className="group flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <div className="p-1 rounded-md bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                    <Share2 size={16} />
                  </div>
                  <span className="text-sm font-medium">Share</span>
                </button>
              )}

              <button
                onClick={() => setIsAddressPopupVisible(true)}
                className="group flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="p-1 rounded-md bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                  <Mail size={16} />
                </div>
                <span className="text-sm font-medium">Email</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <ModelSelector
                models={models}
                tenantModal={tenantModal}
                plan={plan}
                disabled={!is_project_owner}
                projectId={projectId}
              />

              <div className="flex items-center gap-2">
                <OnyxDeepLinkButton
                  projectId={projectId}
                  projectName={project.name}
                />
              </div>

              {is_project_owner && (
                <button
                  onClick={() => setIsInvitePopupVisible(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow transition-all duration-200"
                >
                  <Users size={16} />
                  <span className="text-sm font-medium">Invite</span>
                </button>
              )}

              <div className="flex items-center gap-2">
                <div className="group relative">
                  <Integrations
                    projectId={projectId}
                    fields={fields}
                    records={records}
                  />
                  {/* Optional: Add a wrapping style if Integrations component doesn't expose one, or assume Integrations needs similar styling update. 
                      Since Integrations is a component, I'll trust it or might need to update it too if it's just a button wrapper. 
                      For now, leaving it as is but wrapped. */}
                </div>
              </div>
            </div>
          </div>

          {fields.length === 0 && (
            <div className="absolute inset-0 z-10"></div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isInvitePopupVisible && (
        <StandardPopup
          isOpen={isInvitePopupVisible}
          title="Send Invite"
          subtitle="Invite team members to collaborate"
          icon={<Users size={24} />}
          onClose={() => setIsInvitePopupVisible(false)}
        >
          <div className='flex justify-between'>
            <CreateInvite projectId={projectId} setIsInvitePopupVisible={setIsInvitePopupVisible} />
          </div>
        </StandardPopup>
      )}

      {isAddressPopupVisible && (
        <FormModal
          visible={isAddressPopupVisible}
          onCancel={() => setIsAddressPopupVisible(false)}
          position="center"
          size="small"
          isHeaderHidden={true}
        >
          <div className='flex justify-between'>
            <Address address={address} setIsAddressPopupVisible={setIsAddressPopupVisible} />
          </div>
        </FormModal>
      )}

      {isShareLinkPopupVisible && (
        <FormModal
          visible={isShareLinkPopupVisible}
          onCancel={() => setIsShareLinkPopupVisible(false)}
          position="center"
          size="small"
          isHeaderHidden={true}
        >
          <div className='flex justify-between'>
            <ShareableLink
              shareableLink={shareableLink}
              isLinkActive={isLinkActive}
              projectId={projectId}
              project={project}
              setIsShareLinkPopupVisible={setIsShareLinkPopupVisible}
            />
          </div>
        </FormModal>
      )}
    </>
  );
}