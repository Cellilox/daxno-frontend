import { currentUser } from "@clerk/nextjs/server"
import ScanView from "@/components/ScanView"
import Records from "@/components/Records"
import CreateColumn from "@/components/forms/CreateColumn"
import Options from "@/components/Options"
import ScanFilesModal from "@/components/ScanFilesModal"
import MobileMenu from '@/components/MobileMenu'
import { fetchAuthed } from "@/lib/api-client"
import { getColumns } from "@/actions/column-actions"
import { getProjectsById } from "@/actions/project-actions"


type ProjectViewProps = {
  params: {
    id: string
  }
}

export default async function ProjectView({ params }: ProjectViewProps) {
  const user = await currentUser()
  const { id } = await params
  const project = await getProjectsById(id)
  const fields = await getColumns(project.id)

  const recordsUrl = `${process.env.NEXT_PUBLIC_API_URL}/records/${id}`
  const recordsResponse = await fetchAuthed(recordsUrl)
  const records = await recordsResponse.json()


  return (
    <>
      <div className="px-4">
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-xl md:text-2xl font-bold text-gray-800 truncate max-w-[200px] sm:max-w-none">
              Project: {project.name}
            </p>
            
            <div className="md:hidden">
              <MobileMenu
                user_id={user?.id}
                projectId={id}
              />
            </div>

            <div className="hidden md:block">
              <ScanFilesModal
                user_id={user?.id}
                projectId={id}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 hidden md:flex md:flex-row md:justify-between md:items-center">
          <CreateColumn 
            projectId={id} 
          />
          <div className="flex items-center space-x-4">
            <ScanView />
            <Options projectId={id}/>
          </div>
        </div>

        <div className="mt-3">
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