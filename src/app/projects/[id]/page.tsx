import { currentUser } from "@clerk/nextjs/server"
import { Undo } from "lucide-react"
import ScanView from "@/components/ScanView"
import Records from "@/components/Records"
import CreateColumn from "@/components/forms/CreateColumn"
import Options from "@/components/Options"
import ScanFilesModal from "@/components/ScanFilesModal"
import MobileMenu from '@/components/MobileMenu'
import { fetchAuthed } from "@/lib/api-client"
import { getColumns } from "@/actions/column-actions"
import { getProjectsById } from "@/actions/project-actions"
import GenOverlayWrapper from "@/components/GenOverlayWrapper"


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
  const linkOwner = ""
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
                linkOwner={linkOwner}
                projectId={id}
                columns={fields}
                records={records}
              />
            </div>
             {fields.length >=1 && 
             <div className="hidden md:flex md:items-center">
               <button className="inline-flex items-center px-4 py-2 mr-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                 <Undo className="w-4 h-4 mr-2" />
                 Undo
               </button>
               <ScanFilesModal
                 linkOwner={linkOwner}
                 projectId={id}
               />
               <GenOverlayWrapper />
             </div>
             }
          </div>
        </div>

        <div className="mt-3 hidden md:flex md:flex-row md:justify-between md:items-center">
          <CreateColumn 
            projectId={id} 
          />
          {fields.length >= 1 &&
           <div className="flex items-center space-x-4">
           <ScanView />
           <Options projectId={id}/>
         </div>
          }
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