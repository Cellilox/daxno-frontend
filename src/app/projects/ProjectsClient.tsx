"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import CreateProjectForm from "@/components/forms/CreateProject";
import FormModal from "@/components/ui/Popup";
import StandardPopup from "@/components/ui/StandardPopup";
import { FolderPlus } from "lucide-react";
import { Project } from "@/types";

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleProjectCreated = () => {
    setShowModal(false);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000)
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <button
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition text-base font-medium"
          onClick={() => setShowModal(true)}
        >
          + Add Project
        </button>
      </div>
      <StandardPopup
        isOpen={showModal}
        title="Create New Project"
        subtitle="Start a new workspace for your documents"
        icon={<FolderPlus size={24} />}
        onClose={() => setShowModal(false)}
      >
        <CreateProjectForm onCreated={handleProjectCreated} onCancel={() => setShowModal(false)} />
      </StandardPopup>
      <div className="mt-8">
        {projects?.length >= 1 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects?.map((project: Project) => (
                <Card project={project} key={project.id} />
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg shadow-inner border border-dashed border-blue-200">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-400 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Projects Yet</h2>
            <p className="text-gray-500 mb-6 text-center max-w-xs">You haven't created any projects. Click the <span className='font-semibold text-blue-600'>+ Add Project</span> button above to get started!</p>
            <button
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition text-base font-medium"
              onClick={() => setShowModal(true)}
            >
              + Add Your First Project
            </button>
          </div>
        )}
      </div>
      {isRefreshing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">
          <div className="bg-white p-6 rounded shadow text-lg">Creating...</div>
        </div>
      )}
    </div>
  );
} 