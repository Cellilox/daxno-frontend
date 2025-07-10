import Records from "@/components/Records"
import CreateColumn from "@/components/forms/CreateColumn"
import { fetchAuthed } from "@/lib/api-client"
import { getColumns } from "@/actions/column-actions"
import { get_project_plan, getProjectsById } from "@/actions/project-actions"
import ExpandableDescription from "@/components/ExpandableDescription"
import CollapsibleActions from "@/components/CollapsibleActions"
import { Metadata } from "next"
import { getModels } from "@/actions/ai-models-actions"
import { Model } from "@/types"

export const metadata: Metadata = {
  title: 'Cellilox | Project Details',
  description: 'Detailed view and management for your selected project. Review, update, and collaborate on your project with Cellilox.'
};

export default async function ProjectView({ params }: { params: Promise<{id: string}>}) {
  const { id } = await params
  const project = await getProjectsById(id)
  console.log('P2', project)
  const fields = await getColumns(project.id)
  const linkOwner = ""
  const recordsUrl = `${process.env.NEXT_PUBLIC_API_URL}/records/${id}`
  const recordsResponse = await fetchAuthed(recordsUrl)
  const records = await recordsResponse.json()
  const is_project_owner = project.is_owner;
  const plan = await get_project_plan(project.owner)
  const aiModels = await getModels()

// the human‑readable names you care about (lowercased for matching)
const allowedPaid = [
  'mistral small 3.1',
  'deephermes 3',
  'optimus alpha',
  'quasar alpha',
  'Claude Sonnet 4',
  'gpt4',
]

// helper to strip prefix and “(free)”
const extractLabel = (full: string) =>
  full
    .split(':')
    .slice(1)
    .join(':')
    .replace(/\(free\)/i, '')
    .trim()

// build two lists
const freeModels = aiModels.filter((m: Model) => m.id.endsWith(':free'))

const paidModels = aiModels.filter((m: Model) => {
  const label = extractLabel(m.name).toLowerCase().replace(/\s+/g, ' ')
  // does any allowedPaid entry appear as a substring?
  return allowedPaid.some((p) => label.includes(p))
})

// debug: see what labels you actually got back
console.log(
  'All normalized labels:',
  aiModels.map((m: Model) => extractLabel(m.name))
)
console.log('Paid matches:', paidModels.map((m: Model) => extractLabel(m.name)))

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 sm:p-6 lg:p-8 shadow-lg rounded-lg">
          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start w-full">
              <div className="flex flex-col gap-1 min-w-0 flex-shrink">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                  Project: {project.name}
                </p>
                <ExpandableDescription description={project.description} />
              </div>
              {fields.length >=1 &&
              <div className="w-full sm:w-auto sm:min-w-[250px] sm:max-w-[300px] flex-shrink-0">
              <CreateColumn projectId={id} />
            </div>
              }
            </div>
            
            {/* Action Buttons */}
            {fields.length >= 1 && (
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
                freeModels={freeModels}
                paidModels={paidModels}
              />
            )}
          </div>
        </div>

        {/* Records Section */}
        <div className="mt-4 sm:mt-6 lg:mt-8">
          <Records
            projectId={id}
            initialFields={fields}
            initialRecords={records}
          />
        </div>
      </div>
    </>
  );
}