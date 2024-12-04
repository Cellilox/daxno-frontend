import { revalidatePath } from "next/cache"
import { auth, currentUser } from "@clerk/nextjs/server"
import Card from "@/components/Card"
type Project = {
    id: number,
    name: string,
    description: string
  }

const url = 'http://localhost:8000/projects'


export default async function Projects () {
    const authObj = await auth()
    const userObj = await currentUser()
    console.log('SessionId', authObj.sessionId)

    const headers = new Headers();
    headers.append('Authorization', `Bearer ${await authObj.getToken()}`);
    if (authObj.sessionId) {
      headers.append('sessionId', authObj.sessionId);
    }


    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    })
    const projects = await response.json()
    console.log('Projects', projects)

    const postHeaders = new Headers();
    postHeaders.append('Authorization', `Bearer ${await authObj.getToken()}`);
    postHeaders.append('Content-Type', 'application/json')
    if (authObj.sessionId) {
      postHeaders.append('sessionId', authObj.sessionId);
    }

    async function addProject(formData: FormData) {
      'use server'
      const name = formData.get('name')
      const res = await fetch(url,
      {
       method: 'POST',
       headers: postHeaders,
       body: JSON.stringify({name})
  })

  if (!res.ok) {
    console.error("Error creating project:", await res.text());
    return;
  }

  const newProject = await res.json();
  revalidatePath("/projects");
  console.log(newProject); 
  }


    return (
        <>
        <div className="p-4">
          <div className="flex flex-col items-end">
          <form action={addProject}>
          <div className="text-lg bold flex justify-end">Register your project</div>
          <div className="mt-3">
          <input type="text" name="name" className="p-3 rounded text-black" placeholder="Type your project name"/>
          <button type='submit' className="p-3 bg-blue-600 rounded ml-3">Add</button>
          </div>
          </form>
          </div>
          {projects.length >= 1?
          <div className="grid grid-cols-4 gap-7 mt-10">
          {projects.map((project: Project) => (
              <Card project={project} key={project.id}/>
          ))}
          </div>:
          <p>No project currently</p>
        }
        </div>
        </>
      )
}

