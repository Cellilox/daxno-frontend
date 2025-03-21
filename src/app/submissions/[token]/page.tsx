import { getLinkData } from "@/actions/submission-actions"
import DropzoneWrapper from "@/components/DropzoneWrapper"

type SubmissionViewProps = {
  params: {
    token: string
  }
}

export default async function Submission({ params }: SubmissionViewProps) {
  const { token } = params
  const link_data = await getLinkData(token)
  console.log(link_data)
  if (!link_data) {
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
          projectId={link_data.project_id}
          linkOwner = {link_data.user_id}
        />
      </div>
    </div>
  );
}