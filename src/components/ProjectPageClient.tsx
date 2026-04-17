'use client';

import { useState, useRef, useCallback } from 'react';
import Records from '@/components/Records';
import ExpandableDescription from '@/components/ExpandableDescription';
import CollapsibleActions from '@/components/CollapsibleActions';
import SelectionBar from '@/components/SelectionBar';
import { Field, DocumentRecord } from '@/components/spreadsheet/types';
import { Model, Project } from '@/types';

interface ProjectPageClientProps {
  project: Project;
  id: string;
  fields: Field[];
  records: DocumentRecord[];
  plan: string;
  subscriptionType?: string;
  is_project_owner: boolean;
  linkOwner: string;
  displayedModels: Model[];
  tenantModel: string;
}

export default function ProjectPageClient({
  project,
  id,
  fields,
  records,
  plan,
  subscriptionType,
  is_project_owner,
  linkOwner,
  displayedModels,
  tenantModel,
}: ProjectPageClientProps) {
  const [selectedCount, setSelectedCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteCallbackRef = useRef<(() => void) | null>(null);
  const clearCallbackRef = useRef<(() => void) | null>(null);

  const handleSelectionChange = useCallback(
    (count: number, onDelete: () => void, onClear: () => void, deleting: boolean) => {
      setSelectedCount(count);
      setIsDeleting(deleting);
      deleteCallbackRef.current = onDelete;
      clearCallbackRef.current = onClear;
    },
    []
  );

  const collapsibleActionsProps = {
    projectId: id,
    project,
    shareableLink: project.shareable_link ?? '',
    isLinkActive: project.link_is_active,
    address: project.address_domain ?? '',
    is_project_owner,
    linkOwner,
    fields,
    records,
    plan,
    subscriptionType,
    models: displayedModels,
    tenantModal: tenantModel,
  };

  return (
    <>
      {/* White header card */}
      <div className="bg-white p-4 sm:p-6 lg:p-8 shadow-lg rounded-lg flex-shrink-0">
        <div className="flex flex-col space-y-4 sm:space-y-6">
          {/* Header row: title + mobile 3-dot menu */}
          <div className="flex flex-row justify-between items-start gap-2 sm:gap-4 w-full">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <p
                data-testid="project-details-title"
                className="text-2xl leading-8 font-bold text-gray-800 break-words font-sans"
              >
                Project: {project.name}
              </p>

              {/* Mobile: swap description with selection bar when items are selected */}
              <div className="md:hidden">
                {selectedCount > 0 ? (
                  <SelectionBar
                    count={selectedCount}
                    isDeleting={isDeleting}
                    onDelete={() => deleteCallbackRef.current?.()}
                    onClear={() => clearCallbackRef.current?.()}
                  />
                ) : (
                  <ExpandableDescription description={project.description ?? ''} />
                )}
              </div>

              {/* Desktop: always show description */}
              <div className="hidden md:block">
                <ExpandableDescription description={project.description ?? ''} />
              </div>
            </div>

            {/* Mobile: 3-dot menu */}
            <div className="flex-shrink-0 md:hidden">
              <CollapsibleActions {...collapsibleActionsProps} />
            </div>
          </div>

          {/* Desktop: full action buttons row */}
          <div className="hidden md:block">
            <CollapsibleActions {...collapsibleActionsProps} />
          </div>
        </div>
      </div>

      {/* Records section */}
      <div className="mt-4 flex-1 min-h-0 overflow-hidden">
        <Records
          projectId={id}
          initialFields={fields}
          initialRecords={records}
          project={project}
          subscriptionType={subscriptionType}
          onSelectionChange={handleSelectionChange}
        />
      </div>
    </>
  );
}
