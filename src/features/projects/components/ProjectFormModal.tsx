import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { MODELS } from '../../../utils/modelConfig';
import {
  useCreateProjectMutation,
  useGetProjectQuery,
  useUpdateProjectMutation,
} from '../projectsApi';
import { ProjectAttachmentsPanel } from './ProjectAttachmentsPanel';
import { useAppDispatch } from '../../../app/hooks';
import { showToast } from '../../../app/uiSlice';
import type { Project } from '../../../types/project.types';
import { clsx } from 'clsx';

const EMOJI_PRESETS = ['📁', '🚀', '💼', '📚', '🎨', '🔬', '💡', '🛠️', '📝', '🎯'];
const COLOR_PRESETS = ['#7c6af7', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899', '#6366F1'];

export interface ProjectFormValues {
  name:          string;
  emoji:         string;
  colour_hex:    string;
  description:   string;
  system_prompt: string;
  default_model: string;
}

const EMPTY: ProjectFormValues = {
  name:          '',
  emoji:         '📁',
  colour_hex:    '#7c6af7',
  description:   '',
  system_prompt: '',
  default_model: '',
};

interface Props {
  open:     boolean;
  onClose:  () => void;
  project?: Project | null;
  onSaved?: (project: Project) => void;
}

export function ProjectFormModal({ open, onClose, project, onSaved }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isEdit   = Boolean(project);

  const [form, setForm] = useState<ProjectFormValues>(EMPTY);
  const [createProject, { isLoading: creating }] = useCreateProjectMutation();
  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();

  const projectId = project?.id ?? project?._id;
  const { data: freshProject } = useGetProjectQuery(projectId!, {
    skip: !open || !isEdit || !projectId,
  });
  const projectForFiles = freshProject ?? project;

  useEffect(() => {
    if (!open) return;
    if (project) {
      setForm({
        name:          project.name,
        emoji:         project.emoji ?? '📁',
        colour_hex:    project.colour_hex ?? '#7c6af7',
        description:   project.description ?? '',
        system_prompt: project.system_prompt ?? '',
        default_model: project.default_model ?? '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, project]);

  const set = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) {
      dispatch(showToast({ message: 'Project name is required', type: 'error' }));
      return;
    }

    const body = {
      name,
      emoji:         form.emoji || null,
      colour_hex:    form.colour_hex || null,
      description:   form.description.trim() || null,
      system_prompt: form.system_prompt.trim() || null,
      default_model: form.default_model || null,
    };

    try {
      if (isEdit && project) {
        const id = project.id ?? project._id;
        const saved = await updateProject({ id, ...body }).unwrap();
        dispatch(showToast({ message: 'Project updated', type: 'success' }));
        onSaved?.(saved);
        onClose();
      } else {
        const saved = await createProject(body).unwrap();
        dispatch(showToast({ message: 'Project created', type: 'success' }));
        onSaved?.(saved);
        onClose();
        const id = saved.id ?? saved._id;
        navigate(`/projects/${id}`);
      }
    } catch (err: unknown) {
      const data = (err as { data?: { message?: string; upgrade_url?: string } })?.data;
      dispatch(showToast({
        message: data?.message ?? 'Could not save project',
        type: 'error',
      }));
    }
  };

  const loading = creating || updating;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit project' : 'New project'}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="project-name"
          label="Name"
          placeholder="e.g. Marketing, Side project"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          maxLength={50}
          autoFocus
        />

        <div>
          <p className="mb-2 text-sm font-medium text-gray-300">Icon</p>
          <div className="flex flex-wrap gap-2">
            {EMOJI_PRESETS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => set('emoji', e)}
                className={clsx(
                  'flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-colors',
                  form.emoji === e
                    ? 'border-potato-500 bg-potato-500/10'
                    : 'border-surface-3 bg-surface-2 hover:border-surface-4',
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-gray-300">Color</p>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('colour_hex', c)}
                className={clsx(
                  'h-8 w-8 rounded-full border-2 transition-transform',
                  form.colour_hex === c ? 'scale-110 border-white' : 'border-transparent',
                )}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        <Input
          id="project-desc"
          label="Description (optional)"
          placeholder="What is this project for?"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          maxLength={500}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="project-instructions" className="text-sm font-medium text-gray-300">
            Instructions
          </label>
          <p className="text-xs text-gray-500">
            Custom instructions apply to every chat in this project — like ChatGPT project memory.
          </p>
          <textarea
            id="project-instructions"
            value={form.system_prompt}
            onChange={(e) => set('system_prompt', e.target.value)}
            placeholder="e.g. You are a senior React developer. Prefer TypeScript, concise answers, and code examples."
            rows={4}
            className="w-full resize-y rounded-lg border border-surface-3 bg-surface-2 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-potato-500 focus:outline-none"
          />
        </div>

        {isEdit && projectForFiles && (
          <ProjectAttachmentsPanel project={projectForFiles} variant="inline" />
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="project-model" className="text-sm font-medium text-gray-300">
            Default model (optional)
          </label>
          <select
            id="project-model"
            value={form.default_model}
            onChange={(e) => set('default_model', e.target.value)}
            className="w-full rounded-lg border border-surface-3 bg-surface-2 px-3 py-2.5 text-sm text-white focus:border-potato-500 focus:outline-none"
          >
            <option value="">Use chat default</option>
            {MODELS.map((m) => (
              <option key={m.slug} value={m.slug}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
