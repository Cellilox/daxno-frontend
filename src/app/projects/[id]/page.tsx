import { getColumns } from "@/actions/column-actions"
import { get_project_plan, getProjectsById, getProjectRecords } from "@/actions/project-actions"
import { Metadata } from "next"
import { getModels, getSelectedModel } from "@/actions/ai-models-actions"
import { Model } from "@/types"
import { getBillingConfigForUser } from "@/actions/settings-actions"
import LayoutFix from "@/components/LayoutFix"
import ProjectPageClient from "@/components/ProjectPageClient"

export const metadata: Metadata = {
  title: 'Cellilox | Project Details',
  description: 'Detailed view and management for your selected project. Review, update, and collaborate on your project with Cellilox.'
};

export default async function ProjectView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Parallelize all data fetching to remove waterfalls
  const [
    project,
    fields,
    aiModels,
    tenantModel
  ] = await Promise.all([
    getProjectsById(id),
    getColumns(id),
    getModels(id),
    getSelectedModel(id)
  ]);

  // Safety Check: If project is missing (404/Deleted), return clean error UI
  if (!project || project.detail || !project.id) {
    console.error(`[ProjectView] Project ${id} not found or inaccessible:`, project);
    return (
      <div data-testid="project-not-found" className="h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="text-xl font-bold font-sans text-gray-800">Project not found</div>
        <p className="text-gray-500">The project you are looking for might have been deleted or moved.</p>
        <a
          href="/projects"
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all font-sans"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  const [
    records,
    plan,
    ownerBillingConfig
  ] = await Promise.all([
    getProjectRecords(id),
    get_project_plan(project.owner),
    getBillingConfigForUser(project.owner)
  ]);

  const is_project_owner = project.is_owner;
  const linkOwner = ""

  // Free-standard users are pinned to the OpenRouter Free Models Router —
  // there is nothing to pick, so short-circuit the model list to a single entry
  // and signal "locked" to downstream components.
  const userPlan = plan?.plan_name || 'Free';
  const subType = plan?.subscription_type;
  const isFreePlan = subType === 'standard' && userPlan === 'Free';

  let displayedModels = aiModels;

  if (isFreePlan) {
    displayedModels = [
      { id: 'openrouter/free', name: 'Free Models Router' } as Model,
    ];
  } else if (ownerBillingConfig?.preferred_models && (
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
      <ProjectPageClient
        project={project}
        id={id}
        fields={fields}
        records={records}
        plan={plan?.plan_name ?? ''}
        subscriptionType={plan?.subscription_type}
        is_project_owner={is_project_owner}
        linkOwner={linkOwner}
        displayedModels={displayedModels}
        tenantModel={tenantModel.selected_model}
        isFreePlan={isFreePlan}
      />
    </div>
  );
}