"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Card from "@/components/Card";
import CreateProjectForm from "@/components/forms/CreateProject";
import DocumentTypePicker from "@/components/forms/DocumentTypePicker";
import StandardPopup from "@/components/ui/StandardPopup";
import { Bot, WifiOff } from "lucide-react";
import { Project } from "@/types";
import { getProjects, createProject } from "@/actions/project-actions";
import { useSyncStatus } from "@/hooks/useSyncStatus";

export default function ProjectsClient({ projects: initialProjects }: { projects: Project[] }) {
  const { isOnline } = useSyncStatus();
  const { user } = useUser();
  const [projectsList, setProjectsList] = useState<Project[]>(initialProjects);
  const [showModal, setShowModal] = useState(false);
  const [pickerMode, setPickerMode] = useState<"picker" | "custom">("picker");
  const [creatingType, setCreatingType] = useState<string | null>(null);
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Offline fallback: when the browser is offline AND the server response
  // came back empty (likely because the SSR fetch couldn't reach the API),
  // surface the last-known cached projects. We deliberately do NOT fall back
  // to cache when online + server returned [] — that's the real state after
  // a backend DB wipe, and trusting the server here is what makes orphan
  // projects disappear from the UI.
  useEffect(() => {
    if (isOnline) return;
    const loadCached = async () => {
      if (!user?.id) return;
      const { getCachedProjects } = await import("@/lib/db/indexedDB");
      const cached = await getCachedProjects(user.id);
      if (cached && cached.length > 0 && projectsList.length === 0) {
        setProjectsList(cached);
      }
    };
    loadCached();
  }, [user?.id, projectsList.length, isOnline]);

  // Sync: Update internal state and cache when props change or on manual refresh
  const refreshProjects = useCallback(async () => {
    try {
      const latest = await getProjects();
      if (latest && Array.isArray(latest)) {
        setProjectsList(latest);
        if (user?.id) {
          const { cacheProjects, syncProjectDeletions } = await import("@/lib/db/indexedDB");
          await cacheProjects(user.id, latest);

          // Sync deletions: remove projects that no longer exist on server
          const syncResult = await syncProjectDeletions(user.id, latest);
          if (syncResult.removed > 0) {
            console.log(`[ProjectsClient] Cleaned ${syncResult.removed} deleted project(s) from cache`);
          }
        }
      }
    } catch (err) {
      console.warn("[ProjectsClient] Failed to refresh projects:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      setProjectsList(initialProjects);
      if (user?.id) {
        (async () => {
          const { cacheProjects } = await import("@/lib/db/indexedDB");
          await cacheProjects(user.id, initialProjects);
        })();
      }
    }
  }, [initialProjects, user?.id]);

  const handleProjectCreated = () => {
    setShowModal(false);
    setPickerMode("picker");
    setIsRefreshing(true);
    refreshProjects();
    setTimeout(() => setIsRefreshing(false), 2000)
  };

  const handleProjectDeleted = (deletedId: string) => {
    setProjectsList(prev => prev.filter(p => p.id !== deletedId));
  };

  const openCreateModal = () => {
    setPickerMode("picker");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPickerMode("picker");
  };

  const handlePickType = async (type: string) => {
    setCreatingType(type);
    try {
      await createProject({ name: type });
      handleProjectCreated();
    } catch (error) {
      console.error("[ProjectsClient] Failed to create agent from type:", error);
      alert("Error creating an agent");
    } finally {
      setCreatingType(null);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          {!isOnline && (
            <div
              data-testid="offline-badge"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full border border-gray-200 shadow-sm"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">Offline</span>
            </div>
          )}
        </div>
        <button
          disabled={!isOnline}
          className={`px-5 py-2 rounded-lg shadow transition text-base font-medium flex items-center gap-2 ${isOnline
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
            }`}
          onClick={openCreateModal}
          data-testid="add-project-button"
        >
          {isOnline ? "+ Create Agent" : "Create Agent (Offline)"}
        </button>
      </div>

      <StandardPopup
        isOpen={showModal}
        title="Create New Agent"
        subtitle={
          pickerMode === "picker"
            ? "Choose the document type most similar to your use case"
            : "Start a new workspace for your documents"
        }
        icon={<Bot size={24} />}
        widthClassName={pickerMode === "picker" ? "max-w-lg" : "max-w-md"}
        onClose={handleCloseModal}
      >
        {pickerMode === "picker" ? (
          <DocumentTypePicker
            isCreating={creatingType !== null}
            creatingLabel={creatingType}
            onPick={handlePickType}
            onCustom={() => setPickerMode("custom")}
          />
        ) : (
          <CreateProjectForm
            onCreated={handleProjectCreated}
            onCancel={() => setPickerMode("picker")}
          />
        )}
      </StandardPopup>

      <div className="mt-8">
        {projectsList?.length >= 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projectsList?.map((project: Project) => (
              <Card
                project={project}
                key={project.id}
                onDeleted={handleProjectDeleted}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg shadow-inner border border-dashed border-blue-200" data-testid="no-projects-view">
            <div className={`p-4 rounded-full mb-4 ${isOnline ? 'bg-blue-50 text-blue-400' : 'bg-gray-50 text-gray-400'}`}>
              {isOnline ? (
                <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              ) : (
                <WifiOff size={64} strokeWidth={1.5} />
              )}
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              {isOnline ? "No Agents Yet" : "You are Offline"}
            </h2>
            <p className="text-gray-500 mb-6 text-center max-w-sm px-6">
              {isOnline
                ? "You haven't created any agents. Click the button above to get started!"
                : "We couldn't find any cached agents on this device. Please connect to the internet to sync your workspace."}
            </p>
            <button
              disabled={!isOnline}
              className={`px-6 py-2 rounded-lg shadow transition text-base font-medium ${isOnline
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                }`}
              onClick={openCreateModal}
              data-testid="add-first-project-button"
            >
              {isOnline ? "+ Create Your First Agent" : "Connect to create agents"}
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