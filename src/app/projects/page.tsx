import { revalidatePath } from "next/cache"
import { auth, currentUser } from "@clerk/nextjs/server"
import Card from "@/components/Card"
import { PageProgressBar } from "@/components/ui/ProgressBar"
import CreateProjectForm from "@/components/forms/CreateProject"
type Project = {
  id: string,
  name: string,
  description: string,
  owner: string
}

const url = `${process.env.NEXT_PUBLIC_API_URL}/projects`


export default async function Projects() {
  const authObj = await auth()
  const user = await currentUser()
  console.log('USER', user?.id)
  console.log('SessionId', authObj.sessionId)

  const headers = new Headers();
  headers.append('Authorization', `Bearer ${await authObj.getToken()}`);
  if (authObj.sessionId) {
    headers.append('sessionId', authObj.sessionId);
  }

  const updateHeaders = new Headers();
  updateHeaders.append('Authorization', `Bearer ${await authObj.getToken()}`);
  updateHeaders.append('Content-Type', 'application/json')
  
  if(authObj.sessionId) {
    updateHeaders.append('sessionId', authObj.sessionId);
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: headers
  })
  const projects = await response.json()
  console.log('Projects', projects)

  const refresh = async () => {
    'use server'
    revalidatePath('/projects')
  }


  return (
    <>
      <div className="min-h-screen p-6 bg-gray-50">
        {/* Header and Form Section */}
        <CreateProjectForm token={await authObj.getToken()} sessionId={authObj.sessionId} refresh={refresh}/>
        {/* Projects Section */}
        <div className="mt-12">
          {projects.length >= 1 ? (
            <>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">All My Projects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project: Project) => (
                  <Card project={project} key={project.id} headers={headers} updateHeaders = {updateHeaders} refresh={refresh}/>
                ))}
              </div>
            </>
          ) : (
            <p className="text-lg text-gray-600 text-center mt-10">
              No projects currently. Start by registering a new project above.
            </p>
          )}
        </div>
      </div>
    </>
  );

}

