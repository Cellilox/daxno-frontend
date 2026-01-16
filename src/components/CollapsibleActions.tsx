'use client';

import { useState } from 'react';
import { Users, Mail, Share2, Upload } from 'lucide-react';
import ProjectActionsMenu from './ProjectActionsMenu';
import ScanFilesModal from './files/ScanFilesModal';
import FormModal from './ui/Popup';
import CreateInvite from './forms/CreateInvite';
import { Field, Record } from './spreadsheet/types';
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
  records: Record[]
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
            <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
              <ScanFilesModal
                linkOwner={linkOwner}
                projectId={projectId}
                plan={plan}
              />

              {is_project_owner && (
                <button
                  onClick={() => setIsShareLinkPopupVisible(true)}
                  className="text-base inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
                >
                  <Share2 className="w-5 h-5 mr-3" />
                  Shareable Link
                </button>
              )}

              <button
                onClick={() => setIsAddressPopupVisible(true)}
                className="text-base inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-5 h-5 mr-3" />
                Mail Attachments
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
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
                  className="text-base inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors"
                >
                  <Users className="w-5 h-5 mr-3" />
                  Invite
                </button>
              )}

              <div className="flex items-center gap-2">
                <Integrations
                  projectId={projectId}
                  fields={fields}
                  records={records}
                />
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
        <FormModal
          visible={isInvitePopupVisible}
          title="Send Invite"
          onCancel={() => setIsInvitePopupVisible(false)}
          position="center"
          size="small"
        >
          <div className='flex justify-between'>
            <CreateInvite projectId={projectId} setIsInvitePopupVisible={setIsInvitePopupVisible} />
          </div>
        </FormModal>
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