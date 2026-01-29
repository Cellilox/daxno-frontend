import { getProjects } from "@/actions/project-actions";
import ProjectsClient from "./ProjectsClient";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Cellilox | Projects',
  description: 'View and manage all your projects in one place. Create, edit, and organize your work efficiently with Cellilox.'
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectsClient projects={projects} />;
}

