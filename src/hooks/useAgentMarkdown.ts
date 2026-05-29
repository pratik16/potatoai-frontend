import { useCallback, useEffect, useState } from 'react';

const cache = new Map<string, string>();

/** Load synced agent doc from public/team-agents/{id}.md */
export function useAgentMarkdown(agentId: string, enabled: boolean) {
  const [markdown, setMarkdown] = useState<string | null>(() => cache.get(agentId) ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (cache.has(agentId)) {
      setMarkdown(cache.get(agentId)!);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/team-agents/${agentId}.md`);
      if (!res.ok) throw new Error(`Could not load overview (${res.status})`);
      const text = await res.text();
      cache.set(agentId, text);
      setMarkdown(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    if (enabled && !markdown && !loading && !error) {
      void load();
    }
  }, [enabled, markdown, loading, error, load]);

  return { markdown, loading, error, reload: load };
}
