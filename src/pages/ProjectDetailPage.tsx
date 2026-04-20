import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Plus } from 'lucide-react';
import { useGetProjectQuery } from '../features/projects/projectsApi';
import { Spinner } from '../components/ui/Spinner';
import { Button } from '../components/ui/Button';
import { formatChatDate } from '../utils/formatDate';
import { MODEL_NAMES, MODEL_COLORS } from '../utils/modelConfig';
import { Badge } from '../components/ui/Badge';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useGetProjectQuery(id!, { skip: !id });

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

  const chats = project.chats?.data ?? [];

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      {/* Header */}
      <div
        className="border-b border-surface-3 px-6 py-5"
        style={{ borderTopColor: project.colour_hex ?? undefined, borderTopWidth: project.colour_hex ? 3 : undefined }}
      >
        <Link to="/projects" className="mb-3 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Projects
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{project.emoji ?? '📁'}</span>
            <div>
              <h1 className="text-xl font-semibold text-white">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-gray-400">{project.description}</p>
              )}
            </div>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4" /> New chat
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {project.chat_count} {project.chat_count === 1 ? 'chat' : 'chats'}
          </span>
          {project.default_model && (
            <Badge style={{ backgroundColor: (MODEL_COLORS[project.default_model] ?? '#7c6af7') + '22', color: MODEL_COLORS[project.default_model] ?? '#7c6af7' }}>
              {MODEL_NAMES[project.default_model] ?? project.default_model}
            </Badge>
          )}
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-auto p-6">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <MessageSquare className="mb-3 h-10 w-10 opacity-30" />
            <p className="mb-1 font-medium text-gray-400">No chats yet</p>
            <p className="text-sm">Start a conversation in this project.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => {
              const chatId = (chat as typeof chat & { id?: string }).id ?? chat._id;
              const color  = chat.model ? MODEL_COLORS[chat.model] ?? '#7c6af7' : '#7c6af7';
              const label  = chat.model ? (MODEL_NAMES[chat.model] ?? chat.model.split('-')[0]) : null;
              return (
                <Link
                  key={chatId}
                  to={`/chat/${chatId}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-surface-2 transition-colors"
                >
                  <span className="truncate text-gray-200">{chat.title || 'Untitled'}</span>
                  <div className="ml-3 flex shrink-0 items-center gap-2">
                    {label && (
                      <Badge style={{ backgroundColor: color + '22', color }}>{label.split(' ')[0]}</Badge>
                    )}
                    <span className="text-xs text-gray-500">{formatChatDate(chat.last_message_at)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
