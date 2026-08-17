/**
 * Is this a model the chat picker may offer?
 *
 * `type` only exists on responses from the image-catalogue release onward, and
 * the SPA ships separately from the API — a check that hard-required the field
 * would filter every row out and leave users with an empty picker for the whole
 * window where the new bundle runs against the old backend. So:
 *
 *   absent / null / 'text' → text (chat-capable)
 *   anything else          → not text
 *
 * Absent fails open (old API, everything was text), while an unrecognised value
 * fails closed, so a future non-chat kind stays out of the picker by default.
 */
export function isTextModel(model: { type?: string | null }): boolean {
  return model.type === undefined || model.type === null || model.type === 'text';
}

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
