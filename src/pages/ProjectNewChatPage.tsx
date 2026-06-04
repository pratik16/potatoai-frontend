import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppDispatch } from '../app/hooks';
import { setActiveChat, clearMessages, setModel } from '../features/chat/chatSlice';
import { useGetProjectQuery } from '../features/projects/projectsApi';
import { MessageInput } from '../features/chat/components/MessageInput';
import { Spinner } from '../components/ui/Spinner';
import { MODEL_NAMES } from '../utils/modelConfig';

export default function ProjectNewChatPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { data: project, isLoading } = useGetProjectQuery(id!, { skip: !id });

  useEffect(() => {
    dispatch(setActiveChat(null));
    dispatch(clearMessages());
  }, [dispatch, id]);

  useEffect(() => {
    if (project?.default_model) {
      dispatch(setModel(project.default_model));
    }
  }, [dispatch, project?.default_model]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray-400">
        <p>Project not found.</p>
        <Link to="/projects" className="text-sm text-potato-500 hover:text-potato-400">Back to projects</Link>
      </div>
    );
  }

  const projectId = project.id ?? project._id;
  const modelLabel = project.default_model
    ? MODEL_NAMES[project.default_model] ?? project.default_model
    : null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div
        className="flex items-center gap-3 border-b border-surface-3 px-4 py-3"
        style={{ borderTopWidth: 3, borderTopColor: project.colour_hex ?? undefined }}
      >
        <Link
          to={`/projects/${projectId}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="text-lg">{project.emoji ?? '📁'}</span>
          <span className="font-medium text-white">{project.name}</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <span className="mb-3 text-4xl">{project.emoji ?? '📁'}</span>
        <h1 className="text-xl font-semibold text-white">New chat in {project.name}</h1>
        {project.system_prompt && (
          <p className="mt-2 max-w-md text-sm text-gray-500 line-clamp-3">
            Instructions: {project.system_prompt}
          </p>
        )}
        {modelLabel && (
          <p className="mt-2 text-xs text-gray-600">Default model: {modelLabel}</p>
        )}
        <p className="mt-4 text-sm text-gray-500">Send a message below to start.</p>
      </div>

      <MessageInput projectId={projectId} />
    </div>
  );
}
