import Records from "@/components/Records"
import CreateColumn from "@/components/forms/CreateColumn"
import { fetchAuthed } from "@/lib/api-client"
import { getColumns } from "@/actions/column-actions"
import { get_project_plan, getProjectsById } from "@/actions/project-actions"
import ExpandableDescription from "@/components/ExpandableDescription"
import CollapsibleActions from "@/components/CollapsibleActions"
import { Metadata } from "next"
import { getModels, getSelectedModel } from "@/actions/ai-models-actions"
import { Model } from "@/types"
import { getConversations } from "@/actions/conversations-actions"
import { Message } from "@/components/chat/types"
import { getBillingConfig, getBillingConfigForUser } from "@/actions/settings-actions"
import LayoutFix from "@/components/LayoutFix"

export const metadata: Metadata = {
  title: 'Cellilox | Project Details',
  description: 'Detailed view and management for your selected project. Review, update, and collaborate on your project with Cellilox.'
};

type Conversation = {
  id: string;
  project_id: string;
  owner: string;
  messages: Message[]
}

export default async function ProjectView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Parallelize all data fetching to remove waterfalls
  const [
    project,
    fields,
    aiModels,
    tenantModel,
    allProjectConversation
  ] = await Promise.all([
    getProjectsById(id),
    getColumns(id),
    getModels(id),
    getSelectedModel(id),
    getConversations(id)
  ]);

  // Secondary data that depends on primary data, but can still be parallelized
  const recordsUrl = `${process.env.NEXT_PUBLIC_API_URL}/records/${id}`
  const [
    recordsResponse,
    plan,
    ownerBillingConfig
  ] = await Promise.all([
    fetchAuthed(recordsUrl),
    get_project_plan(project.owner),
    getBillingConfigForUser(project.owner)
  ]);

  const records = await recordsResponse.json()
  const is_project_owner = project.is_owner;
  const linkOwner = ""
  const chats = allProjectConversation?.flatMap((conv: Conversation) => conv.messages);

  // Filter models based on preferences or default restrictions
  let displayedModels = aiModels;

  if (ownerBillingConfig?.preferred_models && (
    (Array.isArray(ownerBillingConfig.preferred_models) && ownerBillingConfig.preferred_models.length > 0) ||
    (typeof ownerBillingConfig.preferred_models === 'object' && ownerBillingConfig.preferred_models.visible && ownerBillingConfig.preferred_models.visible.length > 0)
  )) {
    // User has explicitly selected models
    const pm = ownerBillingConfig.preferred_models;
    let allowedIds: string[] = [];
    if (Array.isArray(pm)) {
      allowedIds = pm;
    } else if (typeof pm === 'object' && pm.visible) {
      allowedIds = pm.visible;
    }

    if (allowedIds.length > 0) {
      console.log('[ProjectView] Filtering models. Total:', aiModels.length, 'Allowed IDs:', allowedIds.length, 'Filtered:', aiModels.filter((m: Model) => allowedIds.includes(m.id)).length);
      displayedModels = aiModels.filter((m: Model) => allowedIds.includes(m.id));
    }
  } else {
    // Fallback: Secure default based on Plan
    // If no preferences set, enforce strict tier limits to prevent unauthorized access
    // Fetch trusted definitions to know which models belong to which tier
    const { getTrustedModels } = await import("@/actions/settings-actions");
    const trusted = await getTrustedModels();

    if (trusted) {
      const userPlan = plan?.plan_name || 'Free';
      let allowedTierIds: string[] = [...(trusted.free || [])];

      if (['Starter', 'Professional'].includes(userPlan)) {
        allowedTierIds = [...allowedTierIds, ...(trusted.starter || [])];
      }
      if (userPlan === 'Professional') {
        allowedTierIds = [...allowedTierIds, ...(trusted.professional || [])];
      }

      // Also include any BYOK/Managed specific logic if needed, but for Standard this is crucial
      displayedModels = aiModels.filter((m: Model) => allowedTierIds.includes(m.id));
    }
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8 pb-4">
      <LayoutFix />
      <div className="bg-white p-4 sm:p-6 lg:p-8 shadow-lg rounded-lg flex-shrink-0">
        <div className="flex flex-col space-y-4 sm:space-y-6">
          {/* Header Section */}
          <div className="flex flex-row justify-between items-start gap-2 sm:gap-4 w-full">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <p className="text-2xl leading-8 font-bold text-gray-800 break-words font-sans">
                Project: {project.name}
              </p>
              <ExpandableDescription description={project.description} />
            </div>

            {/* Mobile: 3-dot menu next to title */}
            {/* Desktop: Actions below (rendered by CollapsibleActions) */}
            <div className="flex-shrink-0 md:hidden">
              <CollapsibleActions
                projectId={id}
                project={project}
                shareableLink={project.shareable_link}
                isLinkActive={project.link_is_active}
                address={project.address_domain}
                is_project_owner={is_project_owner}
                linkOwner={linkOwner}
                fields={fields}
                records={records}
                plan={plan?.plan_name}
                models={displayedModels}
                tenantModal={tenantModel.selected_model}
                chats={chats}
              />
            </div>
          </div>

          {/* Desktop: Full action buttons row */}
          <div className="hidden md:block">
            <CollapsibleActions
              projectId={id}
              project={project}
              shareableLink={project.shareable_link}
              isLinkActive={project.link_is_active}
              address={project.address_domain}
              is_project_owner={is_project_owner}
              linkOwner={linkOwner}
              fields={fields}
              records={records}
              plan={plan?.plan_name}
              models={displayedModels}
              tenantModal={tenantModel.selected_model}
              chats={chats}
            />
          </div>
        </div>
      </div>

      {/* Records Section - Outside the white card */}
      <div className="mt-4 flex-1 min-h-0 overflow-hidden">
        <Records
          projectId={id}
          initialFields={fields}
          initialRecords={records}
          project={project}
        />
      </div>
    </div>
  );
}