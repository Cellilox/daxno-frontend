import { get_project_plan } from "@/actions/project-actions"
import { getProject } from "@/actions/submission-actions"
import DropzoneWrapper from "@/components/files/DropzoneWrapper"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Cellilox | Submission Details',
  description: 'Submit your documents to Cellilox for processing. Only project owner will receive this submission.'
};

export default async function Submission({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const project = await getProject(token)
  if (!project || !project?.link_is_active) {
    return <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <p>Invalid or deleted link</p>
    </div>
  }
  const plan = await get_project_plan(project.owner)
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold text-center mb-4">Upload Your File</h2>
        <p className="text-gray-600 text-center mb-6">
          Please upload the relevant file for your submission. Supported formats are PDF, JPG, and PNG.
        </p>

        <DropzoneWrapper
          projectId={project.id}
          linkOwner={project.owner}
          plan={plan.plan_name}
          linkToken={token}
          subscriptionType={plan.subscription_type}
        />
      </div>
    </div>
  );
}