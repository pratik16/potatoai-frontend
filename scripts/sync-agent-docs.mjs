/**
 * Copies Cursor agent prompts into public/team-agents for the Team UI.
 * Run automatically via predev/prebuild, or: npm run sync:agents
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reactRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(reactRoot, '..');
const outDir = path.join(reactRoot, 'public', 'team-agents');

const files = [
  { src: '.cursor/rules/potatoaihub-orchestrator.mdc', dest: 'main.md' },
  { src: '.cursor/agents/backend-php.md', dest: 'backend-php.md' },
  { src: '.cursor/agents/react-frontend.md', dest: 'react-frontend.md' },
  { src: '.cursor/agents/devops.md', dest: 'devops.md' },
];

fs.mkdirSync(outDir, { recursive: true });

let copied = 0;
for (const { src, dest } of files) {
  const from = path.join(repoRoot, src);
  const to = path.join(outDir, dest);
  if (!fs.existsSync(from)) {
    console.warn(`[sync-agent-docs] skip (missing): ${src}`);
    continue;
  }
  fs.copyFileSync(from, to);
  copied++;
  console.log(`[sync-agent-docs] ${dest}`);
}

if (copied === 0) {
  console.warn('[sync-agent-docs] no files copied — is this the monorepo root?');
  process.exit(1);
}
