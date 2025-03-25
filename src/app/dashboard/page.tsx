import { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of your projects and files",
};

export default function Dashboard() {
  const projectsCount = 0; 
  const filesCount = 0; 


  return (
    <div className="max-w-7xl mx-auto p-6 h-screen bg-gray-50">
      <h2 className="text-4xl font-bold text-gray-800 mb-8">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/projects" className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Projects</h2>
          <p className="text-5xl font-bold text-blue-600">{projectsCount}</p>
          <p className="text-gray-500">Total Projects</p>
        </Link>

        <Link href="/files" className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Files</h2>
          <p className="text-5xl font-bold text-blue-600">{filesCount}</p>
          <p className="text-gray-500">Total Files Processed</p>
        </Link>

      </div>
    </div>
  );
}