'use client';
import React, { useState } from 'react';
import { Pencil, Trash } from 'lucide-react';
import AlertDialog from './ui/AlertDialog';
import { useRouter } from 'next/navigation';
import FormModal from './ui/Popup';
import { deleteProject, updateProject } from '@/actions/project-actions';
import LoadingSpinner from './ui/LoadingSpinner';

type CardProps= {
  project: Project
};

type Project = {
  id: string;
  name: string;
  description: string;
  owner: string;
}

export default function Card({project}: CardProps) {
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
    const url = `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`
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
     setIsPopupVisible(true)
     setSelectedprojectToUpdate(project)
  }

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const updateData = {
      name: selectedProjectToUpdate?.name || '',
      description: selectedProjectToUpdate?.description || '',
      owner: selectedProjectToUpdate?.owner || ''  
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
      <div className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden hover:cursor-pointer" onClick={handleNavigateToProjectPage}>
        <div className="p-4 hover:cursor-point">
          <div className='flex justify-between items-center'>
            <h3 className="text-lg font-bold text-gray-800 mb-2 truncate">{project.name}</h3>
            <div>
              <button
                className="text-blue-500 hover:text-blue-700 text-sm"
                title="Edit column"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShowProjectUpdateForm(project)
                }}
              >
                <Pencil size={14} />
              </button>
              <button
                className="ml-3 text-red-500 hover:text-red-700 text-sm"
                title="Delete column"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShowProjectDeleteAlert(project)
                }}
              >
                <Trash size={14} />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600">Description: {project.description}</p>
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
        <FormModal
          visible={isPopupVisible}
          title="Edit Project"
          onSubmit={handleUpdateProject}
          onCancel={handleCloseUpdatePopup}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseUpdatePopup}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateProject}
              disabled={isLoading}
              className={`min-w-[80px] px-4 py-2 rounded-md text-white ${
                isLoading 
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {!isLoading && 'Save'}
              {isLoading && <LoadingSpinner />}
            </button>
          </div>
        </FormModal>
      )
      }
    </>
  );
}
