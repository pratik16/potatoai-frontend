import { Link } from 'react-router-dom';
import { MessageSquare, Clock, MoreHorizontal } from 'lucide-react';
import type { Project } from '../../../types/project.types';
import { Badge } from '../../../components/ui/Badge';
import { MODEL_NAMES, MODEL_COLORS } from '../../../utils/modelConfig';
import { formatChatDate } from '../../../utils/formatDate';

export function ProjectCard({ project }: { project: Project }) {
  const modelColor = project.default_model ? MODEL_COLORS[project.default_model] : '#7c6af7';
  const modelName  = project.default_model ? MODEL_NAMES[project.default_model] : null;

  return (
    <Link
      to={`/projects/${project.id ?? project._id}`}
      className="group relative flex flex-col rounded-xl border border-surface-3 bg-surface-1 p-5 hover:border-surface-4 transition-colors"
      style={{ borderTopColor: project.colour_hex ?? undefined, borderTopWidth: 3 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-2xl">{project.emoji}</span>
        <span className="text-gray-600 opacity-0 group-hover:opacity-100" aria-hidden>
          <MoreHorizontal className="h-4 w-4" />
        </span>
      </div>

      <h3 className="mb-1 font-semibold text-white">{project.name}</h3>
      {project.description && (
        <p className="mb-3 text-xs text-gray-400 line-clamp-2">{project.description}</p>
      )}

      <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" /> {project.chat_count} chats
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {formatChatDate(project.last_activity_at)}
        </span>
        {modelName && (
          <Badge color={modelColor}>{modelName.split(' ')[0]}</Badge>
        )}
      </div>
    </Link>
  );
}
