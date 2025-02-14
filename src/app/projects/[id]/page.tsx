import { auth, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import ScanView from "@/components/ScanView"
import Records from "@/components/Records"
import CreateColumn from "@/components/forms/CreateColumn"
import Options from "@/components/Options"
import ScanFilesModal from "@/components/ScanFilesModal"
import MobileMenu from '@/components/MobileMenu'

type ProjectViewProps = {
  params: {
    id: string
  }
}


export default async function ProjectView({ params }: ProjectViewProps) {
  const authObj = await auth()
  const user = await currentUser()
  console.log('USER', user?.id)
  const { id } = await params
  const url = `${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`

  let sessionId
  const headers = new Headers()
  headers.append('Authorization', `Bearer ${await authObj.getToken()}`)

  if (authObj.sessionId) {
    headers.append('sessionId', authObj.sessionId)
    sessionId = authObj.sessionId
  }
  const res = await fetch(url, {
    method: 'GET',
    headers: headers
  })
  const project = await res.json()
  console.log(project)

  const fieldsUrl = `${process.env.NEXT_PUBLIC_API_URL}/fields/${project.id}`

  const response = await fetch(fieldsUrl, {
    method: 'GET',
    headers: headers
  })

  const fields = await response.json()
  console.log('FIELS', fields)


  async function onClose() {
    "use server"
    console.log("Modal has closed")
  }

  async function onOk() {
    "use server"
    console.log("Ok was clicked")
  }

  const refresh = async () => {
    'use server'
    revalidatePath(`/projects/${project.id}`);
  }



  const recordsUrl = `${process.env.NEXT_PUBLIC_API_URL}/records/${id}`
  const getRecords = await fetch(recordsUrl, {
    method: 'GET',
    headers: headers
  })

  const records = await getRecords.json()
  console.log('RECORDS', records)


  return (
    <>
      <div className="px-4">
        {/* Project Info and Mobile Menu */}
        <div className="bg-white p-6 shadow-lg rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-xl md:text-2xl font-bold text-gray-800 truncate max-w-[200px] sm:max-w-none">
              Project: {project.name}
            </p>
            
            {/* Mobile Menu */}
            <div className="md:hidden">
              <MobileMenu
                user_id={user?.id}
                sessionId={sessionId}
                projectId={id}
                token={await authObj.getToken()}
                headers={headers}
                onClose={onClose}
                onOk={onOk}
                refresh={refresh}
              />
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:block">
              <ScanFilesModal
                user_id={user?.id}
                sessionId={sessionId}
                projectId={id}
                token={await authObj.getToken()}
                onClose={onClose}
                onOk={onOk}
              />
            </div>
          </div>
        </div>

        {/* Desktop Header Section */}
        <div className="mt-3 hidden md:flex md:flex-row md:justify-between md:items-center">
          <CreateColumn 
            token={await authObj.getToken()} 
            sessionId={sessionId} 
            refresh={refresh} 
            projectId={id} 
          />
          <div className="flex items-center space-x-4">
            <ScanView />
            <Options headers={headers} projectId={id}/>
          </div>
        </div>

        {/* Records Section */}
        <div className="mt-3">
          <Records
            projectId={id}
            initialFields={fields}
            initialRecords={records}
            userId={user?.id}
            token={await authObj.getToken()} 
            sessionId={sessionId} 
            refresh={refresh}
          />
        </div>
      </div>
    </>
  );


}