/**
 * Cursor AI team roster (view-only in app; local dev only — see `utils/env.ts`).
 * Source of truth for prompts: `.cursor/agents/*.md` + `potatoaihub-orchestrator.mdc`
 * To change responsibilities, edit those files or ask main chat to update them.
 */

export interface CursorAgent {
  id: string;
  name: string;
  role: string;
  invoke: string;
  configPath: string;
  owns: string[];
  responsibilities: string[];
  routesWith?: string[];
  doesNot: string[];
  exampleTasks: string[];
}

export const CURSOR_TEAM_INTRO = {
  coordinator:
    'Main chat (no @ or /agent) plans work and delegates to specialists. Use /backend-php, /react-frontend, or /devops to call one directly.',
  updateHint:
    'This page is read-only. To change an agent’s scope, ask in Cursor main chat (e.g. “Update backend-php to also own webhooks”) or edit the agent file under .cursor/agents/.',
};

export const CURSOR_AGENTS: CursorAgent[] = [
  {
    id: 'main',
    name: 'Main agent',
    role: 'Coordinator / PM',
    invoke: 'Default chat (no slash command)',
    configPath: '.cursor/rules/potatoaihub-orchestrator.mdc',
    owns: ['Routing', 'Cross-team merges', 'Full-feature orchestration'],
    responsibilities: [
      'Reads your task and assigns backend, frontend, or devops (or several in parallel).',
      'Ensures API contracts (error codes, FRONTEND_URL) before UI ships brittle workarounds.',
      'Does not replace specialists for deep work in backend/, react/, or docker/.',
    ],
    doesNot: [
      'Automatically log which agent edited which file (ask for an “agent map” summary if needed).',
      'Replace explicit /backend-php or /react-frontend when you want a single owner.',
    ],
    exampleTasks: [
      'Fix Google login',
      'Add Stripe checkout end-to-end',
      'Deploy latest to EC2',
    ],
  },
  {
    id: 'backend-php',
    name: 'backend-php',
    role: 'Senior Laravel / API',
    invoke: '/backend-php',
    configPath: '.cursor/agents/backend-php.md',
    owns: ['backend/'],
    responsibilities: [
      'Laravel API, PostgreSQL, MongoDB, queues, Redis.',
      'Sanctum auth, OAuth (Google/GitHub), credits, Stripe, admin APIs.',
      'AI providers, chat/SSE server, stable API error codes for React.',
      'Contract-first: ship code + status for any UI branch (e.g. EMAIL_NOT_VERIFIED).',
    ],
    routesWith: ['react-frontend (full features)', 'devops (deploy/migrate on server)'],
    doesNot: [
      'Own React UI polish in react/ (coordinates only).',
      'Edit docker/ unless deployment-related with devops.',
    ],
    exampleTasks: [
      'POST /api/auth/social/google',
      'Credits middleware and ledger',
      'SSE stream endpoint and proxy headers',
    ],
  },
  {
    id: 'react-frontend',
    name: 'react-frontend',
    role: 'Senior React / UI',
    invoke: '/react-frontend',
    configPath: '.cursor/agents/react-frontend.md',
    owns: ['react/'],
    responsibilities: [
      'React 18, Vite, Tailwind, Redux, RTK Query, routing.',
      'Auth pages, OAuth buttons, chat UI, useChat, settings.',
      'Branch on API data.code only — never English error message matching.',
      'Initiates backend-php when API contract is missing.',
    ],
    routesWith: ['backend-php (API + codes)', 'devops (SSE/nginx timeouts)'],
    doesNot: [
      'Implement Laravel business logic in backend/.',
      'Use legacy Angular frontend/ unless explicitly asked.',
    ],
    exampleTasks: [
      'SocialAuthButtons and GitHub callback page',
      'Verify-email flow and /verify?key=',
      'Chat layout and streaming client',
    ],
  },
  {
    id: 'devops',
    name: 'devops',
    role: 'Infrastructure & deploy',
    invoke: '/devops',
    configPath: '.cursor/agents/devops.md',
    owns: ['docker/', 'EC2 layout', 'CI deploy workflows'],
    responsibilities: [
      'docker-compose local and prod, Caddy HTTPS, Nginx configs.',
      'EC2: ~/potatoaihub/{backend,frontend-dist,docker}.',
      'Container restarts, logs, migrations on server, security groups.',
      'SSE/proxy timeouts; .env.production structure (never secret values in git).',
    ],
    routesWith: ['backend-php + react-frontend when app code must change for deploy'],
    doesNot: [
      'Rewrite application business logic (coordinates with eng agents).',
      'Commit production secrets.',
    ],
    exampleTasks: [
      'Fix Caddy routing for /api and SPA',
      'GitHub Actions deploy to EC2',
      'postgres/redis container health on prod',
    ],
  },
];

export const ROUTING_TABLE: { task: string; agents: string }[] = [
  { task: 'API, DB, auth, billing, chat backend', agents: 'backend-php' },
  { task: 'UI, pages, Redux, OAuth buttons', agents: 'react-frontend' },
  { task: 'Docker, EC2, deploy, HTTPS, logs', agents: 'devops' },
  { task: 'Full feature (e.g. fix Google login)', agents: 'backend-php + react-frontend' },
  { task: 'SSE/streaming through proxy', agents: 'backend-php + react-frontend (+ devops)' },
];
