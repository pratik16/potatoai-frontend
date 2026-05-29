import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { stripMarkdownFrontmatter } from '../../utils/stripMarkdownFrontmatter';

interface AgentMarkdownPanelProps {
  markdown: string;
}

export function AgentMarkdownPanel({ markdown }: AgentMarkdownPanelProps) {
  const body = stripMarkdownFrontmatter(markdown);

  return (
    <div className="mt-4 max-h-[min(70vh,720px)] overflow-y-auto rounded-lg border border-surface-3 bg-surface-0/80 p-4">
      <article className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white prose-code:text-potato-300 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-surface-2 prose-pre:border prose-pre:border-surface-3 prose-a:text-potato-400 prose-th:text-gray-400 prose-td:text-gray-300">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </article>
    </div>
  );
}
