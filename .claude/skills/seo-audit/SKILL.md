---
name: seo-audit
description: Repeatable SEO audit and update process for the PotatoAIHub/PotatoChat public site (web/). Checks page titles, meta descriptions, OG/Twitter tags, JSON-LD structured data, sitemap.xml, and robots.txt against the keyword tiers in references/keyword-tiers.md; flags drift (new public routes with no meta, shipped features missing from marketing copy, stale sitemap lastmod, duplicate copy across pages) and fixes it. Use when the user asks to "audit SEO", "check rankings", "update SEO", "review keywords", "improve SEO", after adding or changing a public-facing route/page in web/src/pages/, after shipping a feature that should be marketed (new model, new modality, new pricing tier), or on a recurring schedule (e.g. via /loop or a scheduled routine) to keep the site's SEO current over time.
---

# seo-audit — keep PotatoAIHub's SEO current, on a repeat cadence

SEO here is an ongoing process, not a one-off. This skill is the repeatable procedure: audit
what's live, compare it against the target keyword tiers, fix drift, and log what changed —
every time it runs, not just once.

**What this skill can and can't do.** On-page work (titles, meta, structured data, sitemap,
landing copy) makes the site *eligible* to rank — it does not control position. Backlinks,
content depth, domain trust, and indexing status are the bigger levers and mostly require human
action (Google Search Console access, backlink outreach, writing content) that this skill cannot
perform. Every run should end with an honest split: what was fixed in code, and what's still
sitting on the human checklist (see Step 6).

---

## Step 1 — Inventory the current on-page state

Read-only. Don't assume last run's findings still hold — re-check:

```bash
# Every route that renders a <Helmet> (title/description/schema)
grep -rn "Helmet" web/src/pages/*.tsx -l

# Every public route (cross-reference against robots.txt's Allow/Disallow list)
grep -n "path=" web/src/App.tsx
```

- `web/index.html` — static `<title>`, meta description, OG/Twitter tags, JSON-LD blocks (`Organization`, `WebSite`, `SoftwareApplication`, any `FAQPage`).
- `web/public/sitemap.xml` — which URLs are listed, and their `<lastmod>`.
- `web/public/robots.txt` — which routes are `Allow`ed (these are the ones that need real SEO copy) vs `Disallow`ed (skip these — they're app-internal, not marketing surface).
- Each public page's `<Helmet>` block (Login, Register, Privacy, Landing, and any new public page).

## Step 2 — Diff against the keyword tiers

Read `references/keyword-tiers.md` in this skill folder — it is the canonical, git-tracked
keyword list (primary / secondary / long-tail / branded). Do not rely on personal memory for
this; the repo file is the source of truth so it stays correct for anyone running this skill.

For each public page found in Step 1, check:

- Does the title/description use a **primary** term, not just the repeated brand phrase?
- Is copy **duplicated verbatim** across pages? (This was the original bug — every page said
  the same sentence. Each page should carry a distinct primary or secondary term.)
- Are `index.html` and the page's `<Helmet>` **in sync**? They must match — drift between them
  is exactly what caused the last round of repetitive copy.

## Step 3 — Find feature drift

Compare what's actually shipped against what the landing page/FAQ/keyword tiers claim:

```bash
git log --oneline -20              # recent shipped work
grep -n "FEATURES\|FAQS" web/src/pages/LandingPage.tsx
```

If a recent commit shipped something user-facing and differentiating (new model, new modality
like voice/image, a new pricing tier, a new collaboration feature) that isn't in `FEATURES`,
the FAQ, or `keyword-tiers.md`'s secondary tier — that's a gap. Add it in the same pass; don't
leave a "TODO: mention this later."

## Step 4 — Apply fixes

Same pattern as the initial pass:

- Update `web/index.html` title/description/OG/Twitter **and** the matching page's `<Helmet>`
  together, never one without the other.
- New differentiating feature → add to `FEATURES` in `LandingPage.tsx` **and** the secondary
  tier in `keyword-tiers.md`.
- New common question worth a rich result → add to `FAQS` in `LandingPage.tsx` (both the
  visible `<dl>` and the `FAQPage` JSON-LD `mainEntity` array must match — Google penalizes
  schema that doesn't mirror visible content).
- New public route → add it to `sitemap.xml` with today's date as `<lastmod>`, and confirm
  `robots.txt` intentionally allows it (don't allow app-internal routes by accident).
- Existing sitemap entries whose page content changed this run → bump `<lastmod>` to today.
- New brand variant worth capturing (e.g. a nickname people search for) → add to the
  `Organization`/`WebSite` JSON-LD `alternateName` arrays in `index.html`, and fold it into the
  visible meta description the way "Potato AI" was folded in as "PotatoAIHub (Potato AI)".

## Step 5 — Verify

```bash
cd web && npm run build:ci    # tsc && vite build — must pass
```

Manually sanity-check any edited JSON-LD is valid JSON and matches the schema.org shape for its
`@type` (`Organization`, `WebSite`, `SoftwareApplication`, `FAQPage`). There's no automated
schema test in this repo.

## Step 6 — Report the off-page checklist too

Code changes alone don't move rankings. Every run, surface (don't silently skip) the human-only
checklist — ask the user for status rather than assuming:

- Is the domain verified in **Google Search Console** / **Bing Webmaster Tools**? Has the
  current `sitemap.xml` been (re-)submitted since the last content change?
- Any new backlinks since the last audit (directory listings, Product Hunt, blog mentions)?
- Is there a `/blog` or comparison-page plan for the long-tail tier yet, or is it still
  copy-only?

## Step 7 — Update the audit log

Append a row to the **Audit log** table at the bottom of `references/keyword-tiers.md`: date,
what changed, why. This is what makes the next run (yours or another agent's) able to tell what's
already been tried instead of re-deriving it from scratch.

---

## Report format

Close with:

1. **Drift found** — pages/copy out of sync, features missing from marketing, stale sitemap entries.
2. **Fixed this run** — file-by-file, what changed.
3. **Verification** — build result.
4. **Off-page checklist status** — what the user confirmed, what's still open.
5. **Nothing to do?** Say so plainly and name what you checked — don't manufacture busywork.
