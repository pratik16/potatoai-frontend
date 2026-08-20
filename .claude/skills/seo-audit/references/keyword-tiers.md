# PotatoAIHub keyword tiers

Canonical, git-tracked source of truth for SEO keyword targeting. The `seo-audit` skill reads
and updates this file — don't let a duplicate copy drift in personal memory or elsewhere.

Last reviewed: 2026-08-20.

## Primary (head terms)

Used in `<title>`, meta description, OG/Twitter tags, and the landing page H1.

- AI chat app
- chat with multiple AI models
- ChatGPT alternative
- multi-model AI chat
- all-in-one AI chatbot platform

## Secondary (feature-driven)

Used in landing page body copy, the FEATURES list, and JSON-LD descriptions. Add a new entry
here whenever a differentiating feature ships (new model family, new billing tier, new modality).

- switch between Claude, GPT and Gemini
- AI chat with image generation
- AI chat projects and history
- one AI account, multiple models
- AI workspace for chat

## Long-tail

Seeded in `SoftwareApplication.description` and the FAQ section. These deserve dedicated content
(a `/blog` or `/vs/chatgpt` page) once one exists — right now they only live in copy, not in a
page of their own.

- app to chat with GPT, Claude and Gemini in one place
- AI chat app with image generation and projects
- best ChatGPT alternative with multiple models

## Branded (incl. short-form)

In the `Organization`/`WebSite` JSON-LD `alternateName` arrays in `web/index.html`, and folded
into visible meta/OG/Twitter descriptions as "PotatoAIHub (Potato AI)":

- PotatoAIHub
- PotatoChat
- Potato AI Hub
- Potato Hub
- Potato AI — added 2026-08-20 so the shorter query also resolves to the brand, not just the full name

## Audit log

| Date | What changed | Why |
|---|---|---|
| 2026-08-20 | Initial tier set defined; wired into `index.html`, `LandingPage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `PrivacyPolicyPage.tsx`, `sitemap.xml` | Prior copy repeated the same narrow phrase set everywhere and never mentioned image generation or projects |
| 2026-08-20 | Added `WebSite` + `SoftwareApplication` JSON-LD, `Potato AI` brand alternate, FAQPage schema + visible FAQ section | Cover short brand-name search and enable FAQ rich results |
