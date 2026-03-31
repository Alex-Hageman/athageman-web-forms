# Working Notes — Fast Food Favorites Survey

> **Internal document. Not public-facing. Do not commit sensitive values here.**
> Update this file at the end of every session before closing.

---

## How to Use This File (For AI Assistants)

1. Read this entire file before writing a single line of code or making any suggestion.
2. Read `README.md` for the public-facing description of the project, deployment steps, and tech stack overview.
3. Do not change the folder structure, naming conventions, or any established pattern without explicitly discussing it with the developer first.
4. Follow all conventions in the **Conventions** section exactly — do not introduce new patterns.
5. Do not suggest any approach listed under **What Was Tried and Rejected**. Those decisions were made deliberately.
6. Before making any large structural change (new routing library, CSS strategy swap, database provider change, bundler change), ask first.
7. This project was partially AI-assisted. Refactor conservatively — prefer targeted edits over rewrites. Never rewrite a working file from scratch unless all alternatives are exhausted.
8. The Supabase table must exist before the app can submit or load data. If something seems broken, the first question to ask is whether `setup.sql` was run.

---

## Current State

**Last Updated:** 2026-03-31

The app is feature-complete for its course deliverable scope. Both pages render and behave correctly. The Supabase integration is wired up and functional end-to-end once the database table is created. The Azure Static Web Apps deployment pipeline is ready and tested (build passes clean). The dev server runs correctly in Replit.

### What Is Working

- [x] Survey form (`/`) — all 4 questions, inline validation, conditional "Other" input with autofocus, submitting state
- [x] Thank-you confirmation screen with answer summary after successful submit
- [x] Results page (`/results`) — loads all rows from Supabase, computes aggregates, renders 4 charts
- [x] React Router client-side navigation between `/` and `/results`
- [x] Supabase insert on form submit (requires DB table to exist)
- [x] Supabase select on results load (requires DB table to exist)
- [x] Error states on both pages (submit failure, results load failure)
- [x] Responsive single-column layout — mobile, tablet, desktop
- [x] Footer on every page
- [x] Production Vite build — no `PORT`/`BASE_PATH` required, defaults safely
- [x] GitHub Actions workflow for Azure SWA deployment
- [x] `staticwebapp.config.json` with routing fallback and security headers
- [x] SQL setup script with RLS policies

### What Is Partially Built

- [ ] Results page shows a generic "Failed to load" error when the Supabase table doesn't exist — no specific guidance to the user to run `setup.sql`

### What Is Not Started

- [ ] Duplicate submission prevention
- [ ] Admin/export view
- [ ] Loading skeleton on results page
- [ ] Code splitting / lazy loading

---

## Current Task

The project is at a natural stopping point. All core features and deployment infrastructure are complete. The last session focused on Azure SWA deployment readiness: fixing the `vite.config.ts` hard errors for missing env vars, adding security headers to `staticwebapp.config.json`, and creating the GitHub Actions workflow.

**Next step:** Push the repo to GitHub, add the three required GitHub Secrets (`AZURE_STATIC_WEB_APPS_API_TOKEN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), and trigger the first deployment.

---

## Architecture and Tech Stack

| Technology | Version | Why It Was Chosen |
|---|---|---|
| React | 19 | Workspace standard; hooks-based, no class components |
| TypeScript | 5.9 | Workspace standard; full strict typing on all components |
| Vite | 7 | Workspace standard; fast HMR, native ESM, simple config |
| Tailwind CSS | 4 | Workspace standard; utility classes + custom CSS properties for theming |
| React Router | v7 (`react-router-dom`) | Required by course deliverable; replaces earlier wouter prototype |
| Supabase (`@supabase/supabase-js`) | 2.100.1 | User-provided Supabase project; anon key (publishable key format) |
| Recharts | 2.15 | Simple, composable React charting; no canvas dependency |
| pnpm | 10 | Workspace-wide standard; all commands run from repo root |
| Azure Static Web Apps | — | Deployment target specified by course requirements |

---

## Project Structure Notes

```
/                                        ← pnpm workspace root
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml   ← CI/CD for Azure SWA; must not be renamed
├── artifacts/
│   └── fast-food-survey/
│       ├── public/
│       │   ├── favicon.svg
│       │   ├── opengraph.jpg
│       │   └── staticwebapp.config.json  ← SWA routing + security headers
│       ├── src/
│       │   ├── components/
│       │   │   └── Footer.tsx            ← Shared footer, used on all pages
│       │   ├── lib/
│       │   │   └── supabase.ts           ← Supabase client + SurveyResponse type
│       │   ├── pages/
│       │   │   ├── SurveyForm.tsx        ← Route /
│       │   │   └── Results.tsx           ← Route /results
│       │   ├── App.tsx                   ← BrowserRouter + Routes
│       │   ├── index.css                 ← All styles: Tailwind base + full custom CSS
│       │   └── main.tsx                  ← createRoot entry
│       ├── supabase/
│       │   └── setup.sql                 ← One-time DB setup; run in Supabase SQL Editor
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── README.md
└── WORKING_NOTES.md
```

### Non-obvious decisions

- **All CSS lives in `index.css`** — no CSS modules, no component-level style files. Tailwind `@layer` + handwritten BEM-like class names. This was a deliberate choice to keep the project simple for a course deliverable.
- **`BrowserRouter` uses `basename={import.meta.env.BASE_URL.replace(/\/$/, "")}`** — this handles Replit's path-based proxy (where `BASE_URL` is a non-root path) while still working at root `/` on Azure SWA.
- **`vite.config.ts` uses optional `PORT` and `BASE_PATH`** — Replit injects these automatically; they default to `3000` and `/` everywhere else so the Azure build does not throw.
- **`src/lib/supabase.ts` throws at module load time** if the env vars are missing — intentional; fails loudly rather than silently using undefined values.
- **Chain normalization in Results.tsx uses `normalizeChain()`** — title-cases trimmed input so "mcdonalds", "McDonald's", and "MCDONALDS" all collapse to "Mcdonald's". Good enough for a class survey; not a full fuzzy-match.
- **Results page caps chain chart at top 15** — `slice(0, 15)` in `computeStats`. Prevents the chart from becoming unreadably tall with many unique entries.

### Files / folders that must not be changed without discussion

- `supabase/setup.sql` — changing column names or types breaks the live database and the TypeScript interface in `supabase.ts`
- `public/staticwebapp.config.json` — removing the `navigationFallback` breaks client-side routing on Azure
- `.github/workflows/azure-static-web-apps.yml` — the `output_location` value (`dist/public`) must match `vite.config.ts` `build.outDir`

---

## Data / Database

### Table: `survey_responses` (Supabase / PostgreSQL)

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `uuid` | Auto | `gen_random_uuid()` primary key |
| `created_at` | `timestamptz` | Auto | `now()` default |
| `favorite_chain` | `text` | Yes | Free-text; trimmed before insert; title-cased client-side for display only |
| `region` | `text` | Yes | One of: Northeast, Midwest, South, West |
| `frequency` | `text` | Yes | One of: Daily, Multiple times per week, Once a week, Monthly, Rarely/Never |
| `factors` | `text[]` | Yes | Array of selected values from: Price, Speed, Taste, Location/Proximity, Healthy Options, Other |
| `other_factor` | `text` | No | Only present when "Other" is in `factors`; `null` otherwise |

**RLS policies:** Public `INSERT` (anon role) and public `SELECT` (anon role). No auth required. No `UPDATE` or `DELETE` exposed.

---

## Conventions

### Naming conventions

- **Files:** PascalCase for components (`SurveyForm.tsx`, `Results.tsx`, `Footer.tsx`), camelCase for utilities (`supabase.ts`)
- **CSS classes:** kebab-case, BEM-like (`.form-card`, `.form-question`, `.field-error`, `.results-chart-card`)
- **TypeScript interfaces:** PascalCase (`FormValues`, `FormErrors`, `SurveyResponse`, `ChainCount`)
- **Constants:** SCREAMING_SNAKE_CASE (`REGIONS`, `FREQUENCIES`, `FACTORS`, `ACCENT`, `FREQUENCY_ORDER`)

### Code style

- No default exports from utility files (`supabase.ts` uses named exports)
- Page components use default exports
- All event handlers are named `handle<Event>` (`handleSubmit`, `handleChainChange`)
- Inline validation runs client-side on submit; errors are cleared field-by-field as the user corrects them
- `aria-describedby`, `aria-invalid`, `aria-required`, and `role="alert"` used consistently throughout the form

### Framework patterns

- No external form library (no react-hook-form, no Formik) — plain `useState` for form state
- No state management library — local component state only
- No custom hooks — logic lives in the component where it is used (components are small enough)
- Supabase is called directly from page components via the exported client, not through an API layer

### Git commit style

Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`. Keep subject line under 72 characters.

---

## Decisions and Tradeoffs

- **No backend / no Express API layer.** Supabase is called directly from the browser using the anon (publishable) key. The anon key is intentionally public. All access control is enforced by Supabase RLS policies. Do not suggest adding a proxy API layer — it is not needed for a public survey with no sensitive data.
- **No authentication.** The survey is anonymous and public. Any user can submit and view results. This is intentional for a course survey.
- **Single CSS file.** All styles are in `index.css`. This keeps things simple for a course project. Do not suggest CSS modules, styled-components, or any other CSS-in-JS solution.
- **React Router over wouter.** The initial prototype used `wouter` but was switched to `react-router-dom` to satisfy the course deliverable requirement explicitly calling for React Router.
- **No component library.** shadcn/ui components were scaffolded by the Replit template but were removed because they were entirely unused and added ~55 files and hundreds of KB to the codebase. The app uses hand-written CSS.
- **Recharts over Chart.js or Victory.** Recharts is React-native, composable via JSX, and integrates cleanly with TypeScript. Chart.js requires imperative canvas manipulation.
- **Build output at `dist/public`.** This matches the Azure SWA action's `output_location` setting and is how the Replit artifact template is configured. Do not change this path.

---

## What Was Tried and Rejected

- **`wouter` for routing** — used in the initial build, then replaced with `react-router-dom` due to course requirements. Do not suggest reverting to wouter.
- **shadcn/ui component library** — scaffolded automatically by the Replit template (~55 components). Removed entirely because none were used and they inflated the project with `"use client"` directives and generated boilerplate inconsistent with a Vite SPA. Do not suggest adding shadcn/ui back.
- **`tw-animate-css`** — included by the scaffold template via `@import "tw-animate-css"` in `index.css`. Removed because no animation utilities from it were used. Do not suggest re-adding it.
- **`@assets` path alias** — scaffolded to point at a Replit-specific `attached_assets` directory. Removed because it did not exist outside Replit and caused build errors in Azure's CI environment.
- **Hard errors for `PORT` and `BASE_PATH` in `vite.config.ts`** — the original template threw if these were unset. Replaced with safe defaults so the Azure production build does not fail. Do not restore the hard-error behavior.
- **`react-hook-form`** — listed as a devDependency in the original scaffold. Removed along with all unused scaffold deps. Do not suggest adding it back — the form is simple enough to manage with `useState`.

---

## Known Issues and Workarounds

**Issue 1: Results page shows a generic error when the Supabase table does not exist**
- The error `"Failed to load results. Please try again."` appears on the results page before `setup.sql` has been run in Supabase. This is expected behavior but the message gives no guidance.
- Workaround: none — the developer must run `supabase/setup.sql` manually in the Supabase SQL Editor before using the app.
- Do not remove the error state — it is the correct behavior when the DB call fails.

**Issue 2: No duplicate submission prevention**
- A user can submit the survey multiple times by refreshing and resubmitting. There is no server-side deduplication and no client-side `localStorage` guard.
- Workaround: none currently. Acceptable for a course survey with a known respondent pool.

**Issue 3: Production bundle is 810 KB (uncompressed)**
- All dependencies are bundled into a single chunk. Recharts and `@supabase/supabase-js` are the main contributors.
- Workaround: the gzip size is ~231 KB, which is acceptable for a course project. Vite emits a chunk-size warning during build — this is expected and can be ignored.
- Do not implement code splitting unless explicitly asked — it would add complexity for minimal user-facing gain.

**Issue 4: Recharts tooltip can overflow the chart card on very narrow screens**
- On screens narrower than ~320 px, the Recharts tooltip on the chains bar chart may render outside the card boundary.
- Workaround: none. Not a practical issue for the intended respondent devices.

---

## Browser / Environment Compatibility

### Front-end

| Browser | Status |
|---|---|
| Chrome 120+ | Tested — fully working |
| Firefox 120+ | Expected to work — not explicitly tested |
| Safari 17+ | Expected to work — not explicitly tested |
| Edge 120+ | Expected to work — not explicitly tested |
| Mobile Chrome (Android) | Tested via Replit preview — fully working |

- Uses `import.meta.env` (Vite-specific) — not compatible with non-Vite bundlers without modification
- Uses CSS custom properties (`var(--*)`) — requires a modern browser; no IE support

### Back-end / Build Environment

| Dependency | Version / Notes |
|---|---|
| Node.js | 20 LTS (GitHub Actions), 24 (Replit) |
| pnpm | 10 |
| OS | Ubuntu (GitHub Actions), NixOS (Replit) |
| `PORT` env var | Required in Replit (auto-injected); optional elsewhere (defaults to 3000) |
| `BASE_PATH` env var | Required in Replit (auto-injected); optional elsewhere (defaults to `/`) |
| `VITE_SUPABASE_URL` | Required at build time and runtime |
| `VITE_SUPABASE_ANON_KEY` | Required at build time and runtime |

---

## Open Questions

- Should duplicate submissions be prevented before the survey goes live? If so, a `localStorage` token is the simplest approach — ask before implementing.
- Are there additional questions planned beyond the current four? Adding columns to `survey_responses` requires a migration in Supabase and a matching update to the TypeScript `SurveyResponse` interface in `supabase.ts`.
- Should the results page auto-refresh on a timer, or is a manual page reload acceptable for this course context?
- Is a custom domain needed for the Azure SWA deployment, or is the auto-generated `.azurestaticapps.net` URL sufficient?

---

## Session Log

### 2026-03-31

**Accomplished:**
- Built full survey form with 4 questions, inline validation, conditional "Other" input with autofocus, Supabase insert, and thank-you confirmation screen
- Built results page with 4 Recharts visualizations (total count, frequency bar, chains horizontal bar with normalization, regional participation with % labels)
- Set up React Router (`react-router-dom`) with `/` and `/results` routes
- Configured Supabase client; wrote `setup.sql` with DDL and RLS policies
- Removed all unused scaffold code (shadcn/ui components, wouter, tw-animate-css, react-hook-form)
- Fixed `vite.config.ts` to make `PORT` and `BASE_PATH` optional for Azure CI builds
- Added GitHub Actions workflow for Azure Static Web Apps deployment
- Added security headers to `staticwebapp.config.json`
- Wrote `README.md` (public-facing) and `WORKING_NOTES.md` (this file)

**Left incomplete:**
- Duplicate submission prevention
- Results page error message does not guide user to run `setup.sql`

**Decisions made:**
- Use `react-router-dom` (not wouter) per course requirement
- All CSS in single `index.css` file; no component libraries
- No backend proxy; Supabase called directly from browser with publishable anon key

**Next step:** Push to GitHub → add three Secrets → verify first Azure SWA deployment succeeds.

---

## Useful References

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript) — insert, select, RLS
- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security) — policy syntax reference
- [React Router v7 Docs — BrowserRouter](https://reactrouter.com/en/main/routers/browser-router) — `basename` prop
- [Recharts API Reference](https://recharts.org/en-US/api) — `BarChart`, `Bar`, `LabelList`, `ResponsiveContainer`
- [Vite Environment Variables](https://vite.dev/guide/env-and-mode) — `import.meta.env.VITE_*`
- [Azure Static Web Apps — Configuration](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration) — `staticwebapp.config.json` reference
- [Azure/static-web-apps-deploy GitHub Action](https://github.com/Azure/static-web-apps-deploy) — action inputs reference
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs) — `@theme`, `@layer`, custom properties
- [pnpm Filtering](https://pnpm.io/filtering) — `--filter @workspace/package run script`
- **AI tools used:** Claude (Anthropic) — used throughout development for code generation, debugging, and documentation. All generated code was reviewed and tested. The developer should understand every file before submitting.
