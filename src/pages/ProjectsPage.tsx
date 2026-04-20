import { Plus, Filter } from 'lucide-react';
import { useGetProjectsQuery } from '../features/projects/projectsApi';
import { useGetChatsQuery } from '../features/chat/chatApi';
import { ProjectCard } from '../features/projects/components/ProjectCard';
import { ProjectStatsRow } from '../features/projects/components/ProjectStatsRow';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useGetProjectsQuery();
  const { data: chats = [] } = useGetChatsQuery();

  const totalCreditsUsed = 0;

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Projects</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm"><Filter className="h-4 w-4" /> Filter</Button>
          <Button size="sm"><Plus className="h-4 w-4" /> New project</Button>
        </div>
      </div>

      <ProjectStatsRow
        totalProjects={projects.length}
        totalChats={chats.length}
        creditsUsed={totalCreditsUsed}
      />

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center"><Spinner /></div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => <ProjectCard key={p._id} project={p} />)}
          <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-surface-3 p-6 text-gray-500 hover:border-potato-500 hover:text-potato-400">
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">New project</span>
            <span className="text-xs">Organise your chats</span>
          </button>
        </div>
      )}
    </div>
  );
}
