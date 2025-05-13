import Card from "@/components/Card"
import CreateProjectForm from "@/components/forms/CreateProject"

import { getProjects } from "@/actions/project-actions"

type Project = {
  id: string,
  name: string,
  description: string,
  owner: string
  is_owner: string
}

export default async function Projects() {
  const projects = await getProjects()
  return (
    <>
      <div className="min-h-screen p-6 bg-gray-50">
        <CreateProjectForm/>
        <div className="mt-12">
          {projects?.length >= 1 ? (
            <>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">All My Projects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects?.map((project: Project) => (
                  <Card project={project} key={project.id}/>
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

