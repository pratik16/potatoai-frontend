import { useState } from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { useGetProjectsQuery } from '../features/projects/projectsApi';
import { useGetChatsQuery } from '../features/chat/chatApi';
import { ProjectCard } from '../features/projects/components/ProjectCard';
import { ProjectFormModal } from '../features/projects/components/ProjectFormModal';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useGetProjectsQuery({ sort: 'last_activity' });
  const { data: chats = [] } = useGetChatsQuery();
  const [modalOpen, setModalOpen] = useState(false);

  const projectChats = chats.filter((c) => c.project_id).length;

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <div className="border-b border-surface-3 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2">
              <FolderKanban className="h-5 w-5 text-potato-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Projects</h1>
              <p className="text-sm text-gray-500">
                Group chats with shared instructions — like ChatGPT projects.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New project
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Spinner />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="mb-4 text-5xl">📁</span>
            <h2 className="text-lg font-medium text-white">No projects yet</h2>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Create a project to keep related chats together and set custom AI instructions for all of them.
            </p>
            <Button className="mt-6" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> Create your first project
            </Button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-gray-600">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
              {projectChats > 0 && ` · ${projectChats} chats in projects`}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((p) => (
                <ProjectCard key={p.id ?? p._id} project={p} />
              ))}
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-surface-3 p-6 text-gray-500 transition-colors hover:border-potato-500 hover:text-potato-400"
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">New project</span>
              </button>
            </div>
          </>
        )}
      </div>

      <ProjectFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
