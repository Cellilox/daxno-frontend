'use client';
import React, { useState } from 'react';
import { Pencil, Trash } from 'lucide-react';
import AlertDialog from './ui/AlertDialog';
import { useRouter } from 'next/navigation';
import FormModal from './ui/Popup';
import StandardPopup from './ui/StandardPopup';
import { deleteProject, updateProject } from '@/actions/project-actions';
import LoadingSpinner from './ui/LoadingSpinner';
import ExpandableDescription from './ExpandableDescription';
import { Project } from '@/types';

type CardProps = {
  project: Project
};

export default function Card({ project }: CardProps) {
  const router = useRouter()
  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [selectedProjectToDelete, setSelectedProjectToDelete] = useState<Project | null>(null)

  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false)
  const [selectedProjectToUpdate, setSelectedprojectToUpdate] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const handleShowProjectDeleteAlert = (project: Project) => {
    setIsAlertVisible(true)
    setSelectedProjectToDelete(project)
  }

  const handleDeleteProject = async (projectId: string) => {
    setIsLoading(true)
    try {
      await deleteProject(projectId)
      setIsLoading(false)
    } catch (error) {
      alert('Error deleting a project')
    }
  }

  const handleCancelDeleteProject = () => {
    setIsAlertVisible(false)
    setSelectedProjectToDelete(null)
    setIsLoading(false)
  }

  const handleShowProjectUpdateForm = (project: Project) => {
    console.log('PPX', project)
    setIsPopupVisible(true)
    setSelectedprojectToUpdate(project)
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const updateData = {
      ...selectedProjectToUpdate
    };
    try {
      await updateProject(selectedProjectToUpdate?.id, updateData)
      setIsLoading(false)
      setIsPopupVisible(false);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  }

  const handleCloseUpdatePopup = () => {
    setIsPopupVisible(false)
    setSelectedprojectToUpdate(null)
  }


  const handleNavigateToProjectPage = () => {
    router.push(`/projects/${project.id}`)
  }


  return (
    <>
      <div
        className="group relative bg-white border border-gray-200 hover:border-blue-400 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
        onClick={handleNavigateToProjectPage}
      >


        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
            </div>

            {/* Actions - Always visible on mobile, subtle on desktop until hover */}
            {project.is_owner && (
              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                <button
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit project"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShowProjectUpdateForm(project)
                  }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete project"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShowProjectDeleteAlert(project)
                  }}
                >
                  <Trash size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="mb-4 flex-grow">
            <ExpandableDescription description={project.description || 'No description provided.'} maxLength={100} />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs mt-auto">
            <div className="flex items-center gap-2">
              {project.is_shared ? (
                <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium ${project.is_owner
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                  {project.is_owner ? 'Shared Owner' : 'Shared with you'}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  Private
                </span>
              )}
            </div>

            {project.created_at && (
              <span className="text-gray-400">
                {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* --- Record Delete Alert --- */}
      {isAlertVisible && selectedProjectToDelete && (
        <AlertDialog
          visible={isAlertVisible}
          title="Delete Project"
          message="This project and all data associated will be deleted permanently, and there is no going back."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={() => handleDeleteProject(selectedProjectToDelete.id)}
          isLoading={isLoading}
          disabled={isLoading}
          onCancel={handleCancelDeleteProject}
        />
      )}

      {/* --- Project Edit Popup --- */}
      {isPopupVisible && selectedProjectToUpdate && (
        <StandardPopup
          isOpen={isPopupVisible}
          title="Edit Project"
          subtitle="Update your project details"
          icon={<Pencil size={24} />}
          onClose={handleCloseUpdatePopup}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={selectedProjectToUpdate.name}
              onChange={(e) =>
                setSelectedprojectToUpdate({
                  ...selectedProjectToUpdate,
                  name: e.target.value,
                })
              }
              className="w-full p-3 rounded-lg text-gray-800 border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Description
            </label>
            <textarea
              value={selectedProjectToUpdate.description || ''}
              onChange={(e) =>
                setSelectedprojectToUpdate({
                  ...selectedProjectToUpdate,
                  description: e.target.value,
                })
              }
              rows={4}
              className="w-full p-3 rounded-lg text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseUpdatePopup}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProject}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-white shadow transition-colors ${isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {!isLoading && 'Save Changes'}
              {isLoading && <LoadingSpinner />}
            </button>
          </div>
        </StandardPopup>
      )}
    </>
  );
}
