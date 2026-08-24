import { useMemo } from 'react';
import { useGetModelsQuery } from '../chatApi';
import { isTextModel, isAutoModel } from '../../../utils/modelConfig';
import { ModelSelector } from './ModelSelector';

const SUGGESTIONS = [
  { icon: '✍️', label: 'Write a cover letter' },
  { icon: '🐛', label: 'Debug my code'        },
  { icon: '📋', label: 'Plan a project'        },
  { icon: '📄', label: 'Summarise a doc'       },
  { icon: '💡', label: 'Brainstorm ideas'      },
  { icon: '✉️', label: 'Draft an email'        },
];

export function EmptyState() {
  // RTK Query dedupes this against ModelSelector's identical call below, so
  // there's no extra network request — just a shared cache read.
  const { data: allModels } = useGetModelsQuery();
  const modelCount = useMemo(
    () => allModels?.filter((m) => isTextModel(m) && !isAutoModel(m)).length,
    [allModels],
  );

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-surface-3 px-3 py-1 text-xs text-gray-500">
        <span className="h-1.5 w-1.5 rounded-full bg-potato-500" />
        {modelCount ? `${modelCount} AI models · One interface` : 'Multiple AI models · One interface'}
      </div>

      <h1 className="mb-3 text-3xl font-bold text-white">
        Chat with the world's<br />
        <span className="text-potato-500">best AI models</span>
      </h1>
      <p className="mb-8 text-sm text-gray-400">
        Ask anything, plan projects, write code — powered by Claude, GPT, Gemini &amp; more.
      </p>

      <div className="mb-8 flex justify-center">
        <ModelSelector />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            className="flex items-center gap-1.5 rounded-lg border border-surface-3 bg-surface-2 px-3 py-1.5 text-xs text-gray-300 hover:border-potato-500 hover:text-white"
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
