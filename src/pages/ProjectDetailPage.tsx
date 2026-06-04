import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, Plus, Settings2, Trash2, MoreHorizontal,
} from 'lucide-react';
import {
  useGetProjectQuery,
  useDeleteProjectMutation,
} from '../features/projects/projectsApi';
import { ProjectFormModal } from '../features/projects/components/ProjectFormModal';
import { ProjectInstructionsPanel } from '../features/projects/components/ProjectInstructionsPanel';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { MODEL_NAMES, MODEL_COLORS } from '../utils/modelConfig';
import { Badge } from '../components/ui/Badge';
import { ProjectChatListItem } from '../features/projects/components/ProjectChatListItem';
import { useAppDispatch } from '../app/hooks';
import { showToast } from '../app/uiSlice';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: project, isLoading } = useGetProjectQuery(id!, { skip: !id });
  const [deleteProject] = useDeleteProjectMutation();
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400">
        <span className="text-4xl">📂</span>
        <p>Project not found.</p>
        <Link to="/projects" className="text-sm text-potato-500 hover:text-potato-400">Back to projects</Link>
      </div>
    );
  }

  const projectId = project.id ?? project._id;
  const chats = project.chats?.data ?? [];

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${project.name}" and all ${project.chat_count} chats inside it?`)) return;
    try {
      await deleteProject(projectId).unwrap();
      dispatch(showToast({ message: 'Project deleted', type: 'success' }));
      navigate('/projects');
    } catch {
      dispatch(showToast({ message: 'Could not delete project', type: 'error' }));
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div
          className="shrink-0 border-b border-surface-3 px-6 py-5"
          style={{
            borderTopWidth: project.colour_hex ? 3 : undefined,
            borderTopColor: project.colour_hex ?? undefined,
          }}
        >
          <Link
            to="/projects"
            className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All projects
          </Link>

          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="text-3xl">{project.emoji ?? '📁'}</span>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold text-white">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-gray-400">{project.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {project.chat_count} {project.chat_count === 1 ? 'chat' : 'chats'}
                  </span>
                  {project.default_model && (
                    <Badge
                      style={{
                        backgroundColor: (MODEL_COLORS[project.default_model] ?? '#7c6af7') + '22',
                        color: MODEL_COLORS[project.default_model] ?? '#7c6af7',
                      }}
                    >
                      {MODEL_NAMES[project.default_model] ?? project.default_model}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link to={`/projects/${projectId}/new`}>
                <Button size="sm">
                  <Plus className="h-4 w-4" /> New chat
                </Button>
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-surface-2 hover:text-white"
                  aria-label="Project menu"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-surface-3 bg-surface-1 py-1 shadow-xl">
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-surface-2"
                      >
                        <Settings2 className="h-4 w-4" /> Edit project
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMenuOpen(false); handleDelete(); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-surface-2"
                      >
                        <Trash2 className="h-4 w-4" /> Delete project
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="mb-3 h-10 w-10 text-gray-600 opacity-40" />
              <p className="mb-1 font-medium text-gray-300">No chats in this project</p>
              <p className="mb-6 max-w-sm text-sm text-gray-500">
                Start a conversation — project instructions will apply automatically.
              </p>
              <Link to={`/projects/${projectId}/new`}>
                <Button>
                  <Plus className="h-4 w-4" /> Start a chat
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-1">
              {chats.map((chat) => {
                const chatId = (chat as typeof chat & { id?: string }).id ?? chat._id;
                return (
                  <ProjectChatListItem key={chatId} chat={chat} projectId={projectId} />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ProjectInstructionsPanel project={project} />

      <ProjectFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        project={project}
      />
    </div>
  );
}
