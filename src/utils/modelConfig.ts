export const MODELS = [
  { slug: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', color: '#F59E0B', provider: 'anthropic', description: 'Latest Claude — best reasoning & coding'   },
  { slug: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', color: '#F59E0B', provider: 'anthropic', description: 'Best for writing & reasoning'               },
  { slug: 'gpt-5-4',           name: 'GPT-5.4',           color: '#10B981', provider: 'openai',    description: 'OpenAI flagship — powerful & versatile'    },
  { slug: 'gpt-4o',            name: 'GPT-4o',            color: '#10B981', provider: 'openai',    description: 'Great all-rounder, fast'                   },
  { slug: 'gemini-2-5-flash',  name: 'Gemini 2.5 Flash',  color: '#3B82F6', provider: 'google',    description: 'Fast multimodal with 1M token context'     },
  { slug: 'qwen-max',          name: 'Qwen Max',           color: '#EF4444', provider: 'alibaba',   description: 'Strong at code & multilingual'             },
  { slug: 'minimax',           name: 'MiniMax M2.7',       color: '#A855F7', provider: 'minimax',   description: 'Fast, efficient, cost-effective'           },
] as const;

export const MODEL_COLORS: Record<string, string> = Object.fromEntries(
  MODELS.map((m) => [m.slug, m.color]),
);

export const MODEL_NAMES: Record<string, string> = Object.fromEntries(
  MODELS.map((m) => [m.slug, m.name]),
);
