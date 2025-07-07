import { getProjects } from "@/actions/project-actions";
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsClient projects={projects} />;
}

