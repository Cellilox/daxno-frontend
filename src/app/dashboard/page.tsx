import { getDocs } from "@/actions/documents-action";
import { getProjects } from "@/actions/project-actions";
import { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your projects and files",
};

type doc = {
  owner: string,
  id: string,
  page_number: number,
  filename: string
}

export default async function Dashboard() {
  const projects = await getProjects()
  const docs = await getDocs()
  const pages = docs.reduce((acc: number, doc: doc) => acc + doc.page_number, 0);

  return (
    <div className="mx-auto p-6 md:p-12 h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/projects" className="bg-yellow-50 p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Projects</h2>
          <p className="text-4xl font-bold text-blue-600">{projects?.length}</p>
          <p className="text-gray-500">Total Projects</p>
        </Link>

        <div className="bg-blue-50 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pages</h2>
          <p className="text-4xl font-bold text-blue-600">{pages}</p>
          <p className="text-gray-500">{docs?.length} Documents</p>
          <p className="text-xs text-gray-400">Including what you deleted if there is any</p>
        </div>

      </div>
    </div>
  );
}