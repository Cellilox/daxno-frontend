import { getProject } from "@/actions/submission-actions"
import DropzoneWrapper from "@/components/files/DropzoneWrapper"

export default async function Submission({ params }: {params: Promise<{token: string}>}) {
  const { token } = await params
  const project = await getProject(token)
  console.log('Projex', project)
  console.log('projectId', project.id)
  console.log('Owner', project.owner)
  if (!project) {
     return <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <p>Invalid or deleted link</p>
      </div>
  }
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold text-center mb-4">Upload Your File</h2>
        <p className="text-gray-600 text-center mb-6">
          Please upload the relevant file for your submission. Supported formats are PDF, JPG, and PNG.
        </p>
        
        <DropzoneWrapper
          projectId={project.id}
          linkOwner = {project.owner}
          plan = 'Professional' // to be modified later
        />
      </div>
    </div>
  );
}