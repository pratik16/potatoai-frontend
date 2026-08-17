# web/ — React 18 + Vite SPA

Specialist agent: **react-frontend** (`.claude/agents/react-frontend.md` at the monorepo root) — it
carries the full folder map, design system, RTK inventory, and chat/SSE details. This file holds
the rule that must apply to *any* agent editing `web/`.

---

## API error handling

**Senior default:** you own the full flow. If the UI routes on an error, you **ensure** the backend
exposes `data.code` (coordinate with **backend-php** yourself), then branch on `code`.
Message/detail matching is junior work — do not ship it, not even temporarily.

### Required pattern

```ts
const err = e as { status?: number; data?: { code?: string; message?: string; detail?: string } };

if (err.status === 403 && err.data?.code === 'EMAIL_NOT_VERIFIED') {
  navigate('/verify-email', { state: { email } });
  return;
}

// Display-only (toast / inline error):
setError(err.data?.message ?? err.data?.detail ?? 'Something went wrong');
```

### Do not

- `detail === 'Email not verified'`, or a regex over English copy — i18n will break it.
- Implement a new auth/verify page without confirming the backend returns a stable `code`.
- Assume `localhost:4200`. React dev is **`http://localhost:3000`** (Vite), proxying `/api` → `:8000`.
  Email links use `FRONTEND_URL` from the backend.

### When the backend has no `code` yet

**You** initiate the fix — don't wait to be told:

1. Spawn **backend-php** (or edit `backend/` yourself if you are the main agent) to add the `code`
   (e.g. `EMAIL_NOT_VERIFIED`).
2. Then implement the React branch on `data.code`.
3. Do **not** ship message-matching, a regex, or a "TODO: add code later".

The same ownership applies beyond auth: a wrong `FRONTEND_URL`, a missing `/verify` route, an email
link pointing at the wrong host — fix or delegate it in the same task.

### Auth routes

| Route | Purpose |
|-------|---------|
| `/verify-email` | Resend verification (unverified login) |
| `/verify?key=` | Email link → `POST /api/auth/users/verify` |

### Pairing

`backend/CLAUDE.md` holds the matching rule: backend owns the `code`, frontend owns the branching
and UX. The Android client in `mobile/` branches on the same `code` values — a new one is worth
mentioning to **android-mobile**.

---

## Quality gate

Run `npm run build` (`tsc && vite build`) after non-trivial TypeScript or routing changes, and
`npm run lint` for style. Both are run from `web/`.
