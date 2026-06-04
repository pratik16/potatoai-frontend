import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useUpdateProjectMutation } from '../projectsApi';
import { useAppDispatch } from '../../../app/hooks';
import { showToast } from '../../../app/uiSlice';
import type { Project } from '../../../types/project.types';

interface Props {
  project: Project;
}

export function ProjectInstructionsPanel({ project }: Props) {
  const dispatch = useAppDispatch();
  const id = project.id ?? project._id;
  const [instructions, setInstructions] = useState(project.system_prompt ?? '');
  const [dirty, setDirty] = useState(false);
  const [updateProject, { isLoading }] = useUpdateProjectMutation();

  useEffect(() => {
    setInstructions(project.system_prompt ?? '');
    setDirty(false);
  }, [project.system_prompt, id]);

  const save = async () => {
    try {
      await updateProject({
        id,
        system_prompt: instructions.trim() || null,
      }).unwrap();
      setDirty(false);
      dispatch(showToast({ message: 'Instructions saved', type: 'success' }));
    } catch {
      dispatch(showToast({ message: 'Could not save instructions', type: 'error' }));
    }
  };

  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-surface-3 bg-surface-1 lg:w-72 lg:border-l lg:border-t-0">
      <div className="border-b border-surface-3 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Sparkles className="h-4 w-4 text-potato-400" />
          Project instructions
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Applied to every new message in this project.
        </p>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <textarea
          value={instructions}
          onChange={(e) => {
            setInstructions(e.target.value);
            setDirty(true);
          }}
          placeholder="Add instructions for the AI in this project…"
          rows={8}
          className="min-h-[140px] flex-1 resize-none rounded-lg border border-surface-3 bg-surface-2 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-potato-500 focus:outline-none"
        />
        {dirty && (
          <button
            type="button"
            onClick={save}
            disabled={isLoading}
            className="mt-3 w-full rounded-lg bg-potato-600 py-2 text-sm font-medium text-white hover:bg-potato-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving…' : 'Save instructions'}
          </button>
        )}
      </div>
    </aside>
  );
}
