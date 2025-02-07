import { io } from "socket.io-client"
import Modal from "@/components/Modal"
import { auth, currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import MyDropzone from "@/components/Dropzone"
import ScanView from "@/components/ScanView"
import Records from "@/components/Records"
import CreateColumn from "@/components/forms/CreateColumn"
import Options from "@/components/Options"

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
        {/* Project Info and Modal */}
        <div className="bg-white p-6 shadow-lg rounded-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <p className="text-xl font-bold text-gray-800">Project: {project.name}</p>
            <Modal title="Scan Your Files" onClose={onClose} onOk={onOk}>
              <form className="h-full">
                <div className="h-full">
                  <MyDropzone
                    user_id={user?.id}
                    sessionId={sessionId}
                    projectId={id}
                    token={await authObj.getToken()}
                    onClose={onClose}
                  />
                </div>
              </form>
            </Modal>
          </div>
        </div>
        {/* Header Section */}
        <div className="mt-3 flex flex-col md:flex-row md:justify-between md:items-center space-y-6 md:space-y-0">
          {/* Add Column Form */}
          <CreateColumn token={await authObj.getToken()} sessionId={sessionId} refresh={refresh} projectId={id} />
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
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