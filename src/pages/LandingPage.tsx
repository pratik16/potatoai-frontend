import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../hooks/useTheme';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/ui/Button';
import { MODELS } from '../utils/modelConfig';

const FEATURES: [string, string][] = [
  ['Multi-model in one interface', 'Change models mid-conversation without losing context or history.'],
  ['Projects & organised history', 'Group chats into projects. Find anything instantly with search.'],
  ['Streamed, fast responses', 'See answers appear in real time. No waiting, no spinners.'],
  ['Private & secure', 'Your chats are never used for training. Encrypted at rest.'],
];

export default function LandingPage() {
  useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      <Helmet>
        <title>PotatoAIHub — PotatoChat, AI Chat Reimagined</title>
        <meta
          name="description"
          content="PotatoAIHub is home to PotatoChat — chat with Claude, GPT, Gemini and more AI models in one place. Fast, streamed, multi-model AI chat."
        />
      </Helmet>

      <header className="sticky top-0 z-10 border-b border-surface-3 bg-surface-1 px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <BrandLogo size="md" />
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-300 hover:text-white">
              Sign in
            </Link>
            <Link to="/register">
              <Button size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16">
        <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-surface-3 px-3 py-1 text-xs text-gray-400">
          <span className="h-1.5 w-1.5 rounded-full bg-potato-500" />
          5 AI models, one place
        </div>

        <h1 className="mb-4 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl">
          PotatoAIHub — PotatoChat, the smarter way to chat with AI
        </h1>
        <p className="mb-10 max-w-2xl text-lg text-gray-400">
          PotatoAIHub is the home of PotatoChat, an AI chat workspace that lets you switch between
          Claude, GPT, Gemini and more — without switching tabs. One AI chat account, every model
          you need.
        </p>

        <div className="mb-14 flex flex-wrap gap-3">
          <Link to="/register">
            <Button size="lg">Get started free →</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="secondary">Sign in</Button>
          </Link>
        </div>

        <ul className="mb-12 grid gap-6 sm:grid-cols-2">
          {FEATURES.map(([title, desc]) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 h-5 w-5 shrink-0 rounded bg-surface-3 text-center text-xs leading-5 text-potato-400">
                ✦
              </span>
              <div>
                <p className="font-medium text-white">{title}</p>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <div>
          <p className="mb-3 text-sm text-gray-500">Available models on PotatoChat:</p>
          <div className="flex flex-wrap gap-2">
            {MODELS.map((m) => (
              <span
                key={m.slug}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{ backgroundColor: m.color + '22', color: m.color }}
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-surface-3 bg-surface-1 px-6 py-6 text-center text-sm text-gray-500">
        <p className="mb-2">© {new Date().getFullYear()} PotatoAIHub · PotatoChat</p>
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <Link to="/privacy" className="hover:text-gray-400">Privacy Policy</Link>
          <span aria-hidden>·</span>
          <Link to="/login" className="hover:text-gray-400">Sign in</Link>
        </p>
      </footer>
    </div>
  );
}
