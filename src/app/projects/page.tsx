import { getProjects } from "@/actions/project-actions";
import ProjectsClient from "./ProjectsClient";

export const metadata = {
  title: 'Daxno | Projects',
  description: 'View and manage all your projects in one place. Create, edit, and organize your work efficiently with Daxno.'
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsClient projects={projects} />;
}

