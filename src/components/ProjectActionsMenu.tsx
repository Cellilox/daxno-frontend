'use client';

import { useState, useEffect, useRef } from 'react';
import { MoreVertical, Upload, Share2, Mail, Sparkles, Users, Zap, X } from 'lucide-react';
import ScanFilesModal from './files/ScanFilesModal';
import FormModal from './ui/Popup';
import CreateInvite from './forms/CreateInvite';
import Address from './Address';
import ShareableLink from './ShareableLink';
import { Model, Project } from '@/types';
import ModelSelector from './Models';
import OnyxDeepLinkButton from './OnyxDeepLinkButton';
import Integrations from './integrations/Integrations';
import { Field, Record } from './spreadsheet/types';

interface ProjectActionsMenuProps {
    projectId: string;
    project: Project;
    shareableLink: string;
    isLinkActive: boolean;
    address: string;
    plan: string;
    is_project_owner: boolean;
    linkOwner: string;
    fields: Field[];
    records: Record[];
    models: Model[];
    tenantModal: string;
}

export default function ProjectActionsMenu({
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
    tenantModal,
}: ProjectActionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isInvitePopupVisible, setIsInvitePopupVisible] = useState(false);
    const [isAddressPopupVisible, setIsAddressPopupVisible] = useState(false);
    const [isShareLinkPopupVisible, setIsShareLinkPopupVisible] = useState(false);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isOpen &&
                menuRef.current &&
                buttonRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close menu on ESC key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const handleAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    return (
        <>
            {/* Trigger Button */}
            <div className="relative">
                <button
                    ref={buttonRef}
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                    aria-label="Project actions"
                    aria-expanded={isOpen}
                >
                    <MoreVertical size={20} className="text-gray-700" />
                </button>

                {/* Backdrop */}
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none z-40"
                        onClick={() => setIsOpen(false)}
                    />
                )}

                {/* Popover Menu */}
                {isOpen && (
                    <div
                        ref={menuRef}
                        className="fixed md:absolute left-0 right-0 bottom-0 md:left-auto md:right-0 md:bottom-auto md:top-12 w-full md:w-80 bg-white rounded-t-2xl md:rounded-lg shadow-2xl border-t md:border border-gray-200 z-50 overflow-hidden"
                        style={{
                            animation: window.innerWidth >= 640 ? 'fadeIn 200ms ease-out' : 'slideUp 300ms ease-out'
                        }}
                    >
                        {/* Header with close button - mobile only */}
                        <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-gray-100">
                            <h3 className="text-base font-semibold text-gray-900">Project Actions</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                aria-label="Close menu"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Primary Actions */}
                        <div className="p-3 md:p-2 space-y-1 max-h-[70vh] md:max-h-[600px] overflow-y-auto">
                            <button
                                onClick={() => handleAction(() => setIsScanModalOpen(true))}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={fields.length === 0}
                            >
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Upload size={16} className="text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">Scan Files</p>
                                    <p className="text-xs text-gray-500">Upload documents</p>
                                </div>
                            </button>

                            {is_project_owner && (
                                <button
                                    onClick={() => handleAction(() => setIsShareLinkPopupVisible(true))}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <Share2 size={16} className="text-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">Shareable Link</p>
                                        <p className="text-xs text-gray-500">Generate public link</p>
                                    </div>
                                </button>
                            )}

                            <button
                                onClick={() => handleAction(() => setIsAddressPopupVisible(true))}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                            >
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Mail size={16} className="text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">Mail Attachments</p>
                                    <p className="text-xs text-gray-500">Email forwarding</p>
                                </div>
                            </button>
                        </div>

                        {/* Separator */}
                        <div className="border-t border-gray-100" />

                        {/* Model Selector Section */}
                        {is_project_owner && (
                            <>
                                <div className="p-2">
                                    <div className="px-4 py-2">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                            AI Model
                                        </p>
                                        <ModelSelector
                                            models={models}
                                            tenantModal={tenantModal}
                                            plan={plan}
                                            disabled={false}
                                            projectId={projectId}
                                        />
                                    </div>
                                </div>
                                <div className="border-t border-gray-100" />
                            </>
                        )}

                        {/* Secondary Actions */}
                        <div className="p-2 space-y-1">
                            <div className="px-4 py-2">
                                <OnyxDeepLinkButton projectId={projectId} projectName={project.name} />
                            </div>

                            {is_project_owner && (
                                <button
                                    onClick={() => handleAction(() => setIsInvitePopupVisible(true))}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                                >
                                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Users size={16} className="text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900">Invite</p>
                                        <p className="text-xs text-gray-500">Share with team</p>
                                    </div>
                                </button>
                            )}

                            <div className="px-4 py-2">
                                <Integrations projectId={projectId} fields={fields} records={records} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Scan Files Modal */}
            {isScanModalOpen && (
                <ScanFilesModal
                    linkOwner={linkOwner}
                    projectId={projectId}
                    plan={plan}
                    isOpen={isScanModalOpen}
                    onClose={() => setIsScanModalOpen(false)}
                />
            )}

            {/* Invite Popup */}
            {isInvitePopupVisible && (
                <FormModal
                    visible={isInvitePopupVisible}
                    title="Send Invite"
                    onCancel={() => setIsInvitePopupVisible(false)}
                    position="center"
                    size="small"
                >
                    <div className="flex justify-between">
                        <CreateInvite projectId={projectId} setIsInvitePopupVisible={setIsInvitePopupVisible} />
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
                    <div className="flex justify-between">
                        <Address address={address} setIsAddressPopupVisible={setIsAddressPopupVisible} />
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
                    <div className="flex justify-between">
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
