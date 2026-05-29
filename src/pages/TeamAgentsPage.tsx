import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bot, ChevronDown, ChevronUp, FolderOpen, Terminal } from 'lucide-react';
import { clsx } from 'clsx';
import {
  CURSOR_AGENTS,
  CURSOR_TEAM_INTRO,
  ROUTING_TABLE,
  type CursorAgent,
} from '../data/cursorAgents';
import { AgentMarkdownPanel } from '../components/team/AgentMarkdownPanel';
import { useAgentMarkdown } from '../hooks/useAgentMarkdown';

const ROLE_COLORS: Record<string, string> = {
  main:             'border-potato-500/40 bg-potato-500/10',
  'backend-php':    'border-blue-500/40 bg-blue-500/10',
  'react-frontend': 'border-emerald-500/40 bg-emerald-500/10',
  devops:           'border-amber-500/40 bg-amber-500/10',
};

export default function TeamAgentsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-surface-0 text-white">
      <header className="shrink-0 border-b border-surface-3 bg-surface-1 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link
            to="/settings"
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Settings
          </Link>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-potato-500" />
            <h1 className="text-lg font-semibold">Cursor AI team</h1>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <main className="mx-auto max-w-5xl px-6 py-8 pb-16">
          <p className="mb-2 text-sm text-gray-300">{CURSOR_TEAM_INTRO.coordinator}</p>
          <p className="mb-8 rounded-lg border border-surface-3 bg-surface-1 px-4 py-3 text-xs text-gray-400">
            {CURSOR_TEAM_INTRO.updateHint}
          </p>

          <div className="mb-10 flex flex-col gap-4">
            {CURSOR_AGENTS.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                expanded={expandedId === agent.id}
                onToggle={() =>
                  setExpandedId((id) => (id === agent.id ? null : agent.id))
                }
              />
            ))}
          </div>

          <section className="rounded-xl border border-surface-3 bg-surface-1 p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Coordinator routing (quick reference)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-3 text-gray-500">
                    <th className="pb-2 pr-4 font-medium">You ask for…</th>
                    <th className="pb-2 font-medium">Typical agents</th>
                  </tr>
                </thead>
                <tbody>
                  {ROUTING_TABLE.map((row) => (
                    <tr key={row.task} className="border-b border-surface-3/60 last:border-0">
                      <td className="py-2.5 pr-4 text-gray-300">{row.task}</td>
                      <td className="py-2.5 font-mono text-xs text-potato-400">{row.agents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="mt-6 text-center text-xs text-gray-600">
            Full prompts synced from <span className="font-mono">.cursor/agents/</span> — run{' '}
            <span className="font-mono">npm run sync:agents</span> after edits.
          </p>
        </main>
      </div>
    </div>
  );
}

function AgentCard({
  agent,
  expanded,
  onToggle,
}: {
  agent: CursorAgent;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { markdown, loading, error } = useAgentMarkdown(agent.id, expanded);

  return (
    <article
      className={clsx(
        'rounded-xl border p-5',
        ROLE_COLORS[agent.id] ?? 'border-surface-3 bg-surface-1',
      )}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-white">{agent.name}</h2>
          <p className="text-xs text-gray-400">{agent.role}</p>
        </div>
        <code className="rounded bg-surface-2 px-2 py-1 text-xs text-potato-400">
          {agent.invoke}
        </code>
      </div>

      <div className="mb-3 flex items-start gap-2 text-xs text-gray-500">
        <FolderOpen className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span className="font-mono">{agent.configPath}</span>
      </div>

      <Section title="Owns">
        <TagList items={agent.owns} />
      </Section>

      <Section title="Responsibilities">
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-300">
          {agent.responsibilities.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Section>

      {agent.routesWith && (
        <Section title="Often works with">
          <p className="text-sm text-gray-400">{agent.routesWith.join(' · ')}</p>
        </Section>
      )}

      <Section title="Does not">
        <ul className="list-inside list-disc space-y-1 text-sm text-gray-500">
          {agent.doesNot.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Section>

      <Section title="Example tasks">
        <ul className="space-y-1 text-sm text-gray-400">
          {agent.exampleTasks.map((t) => (
            <li key={t} className="flex items-start gap-2">
              <Terminal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-600" />
              {t}
            </li>
          ))}
        </ul>
      </Section>

      <button
        type="button"
        onClick={onToggle}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-surface-3 bg-surface-2/80 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-surface-3 hover:text-white"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Hide full overview
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            View full agent overview
          </>
        )}
      </button>

      {expanded && (
        <>
          {loading && (
            <p className="mt-4 text-center text-sm text-gray-500">Loading overview…</p>
          )}
          {error && (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}. Run <span className="font-mono">npm run sync:agents</span> in{' '}
              <span className="font-mono">react/</span>.
            </p>
          )}
          {markdown && !loading && <AgentMarkdownPanel markdown={markdown} />}
        </>
      )}
    </article>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-3">
      <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">{title}</h3>
      {children}
    </div>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs text-gray-300"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
