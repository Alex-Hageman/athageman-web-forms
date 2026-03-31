# Fast Food Favorites Survey

## Description

Fast Food Favorites Survey is a two-page web application that collects and visualizes student opinions about fast food preferences in the United States. Respondents answer four questions about their favorite chain, geographic region, dining frequency, and decision-making factors. The results page aggregates all submissions into interactive charts so patterns across respondents can be explored at a glance. Built as a course project for BAIS:3300 at the University of Iowa, Spring 2026.

---

## Badges

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2.15-FF6384?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

---

## Features

- **Four-question survey form** covering favorite chain, US Census region, dining frequency, and selection factors
- **Conditional "Other" input** that appears automatically when the Other checkbox is selected, with autofocus for a smooth experience
- **Inline form validation** highlights missing fields on submit without clearing entered answers
- **Live results dashboard** aggregates all responses from the Supabase database into four Recharts visualizations
- **Chain normalization** groups responses by case-insensitive chain name and sorts by popularity
- **Regional participation chart** shows response counts per US Census region with percentage labels
- **Responsive single-column layout** that works on mobile, tablet, and desktop
- **Azure Static Web Apps ready** with a routing config included for client-side navigation

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI component library |
| TypeScript 5.9 | Static typing |
| Vite 7 | Dev server and production bundler |
| Tailwind CSS 4 | Utility-first styling |
| React Router v7 | Client-side routing (`/` and `/results`) |
| Supabase (`@supabase/supabase-js` v2) | PostgreSQL database — inserts and reads survey responses |
| Recharts 2.15 | Bar chart visualizations on the results page |
| pnpm (workspace) | Monorepo package management |

---

## Getting Started

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | 20 or later | https://nodejs.org |
| pnpm | 10 or later | https://pnpm.io/installation |
| Supabase account | — | https://supabase.com |

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/alexhageman/fast-food-survey.git
cd fast-food-survey
```

2. **Install dependencies** from the monorepo root

```bash
pnpm install
```

3. **Create the database table** — open the Supabase SQL Editor for your project, paste the contents of `artifacts/fast-food-survey/supabase/setup.sql`, and click **Run**. This creates the `survey_responses` table and enables public Row Level Security policies.

4. **Set environment variables** — add the following to your environment (Replit Secrets, `.env.local`, or your CI/CD provider):

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

5. **Start the development server**

```bash
pnpm --filter @workspace/fast-food-survey run dev
```

6. Open `http://localhost:<PORT>` in your browser (the port is printed in the terminal output).

---

## Usage

### Running the app

```bash
# Development
pnpm --filter @workspace/fast-food-survey run dev

# Type-check only
pnpm --filter @workspace/fast-food-survey run typecheck

# Production build
pnpm --filter @workspace/fast-food-survey run build
```

### Pages

| Route | Description |
|---|---|
| `/` | Survey form — fill in all four questions and submit |
| `/results` | Results dashboard — charts update automatically as responses are added |

### Configuration

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Full URL of your Supabase project |
| `VITE_SUPABASE_ANON_KEY` | Yes | Publishable (anon) key from Supabase → Project Settings → API |
| `PORT` | No (auto-set by Replit; defaults to `3000`) | Port the Vite dev server binds to |
| `BASE_PATH` | No (auto-set by Replit; defaults to `/`) | URL base path — leave unset for Azure SWA |

---

## Deploying to Azure Static Web Apps

### One-time Azure setup

1. In the [Azure Portal](https://portal.azure.com), create a new **Static Web App** resource and link it to your GitHub repository.
2. Azure will generate a deployment token. Copy it.
3. In your GitHub repository, add the following **Secrets** (Settings → Secrets and variables → Actions):

| Secret | Value |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Deployment token from Azure |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

### How deployment works

The workflow file at `.github/workflows/azure-static-web-apps.yml` runs automatically on every push to `main`:

1. Installs pnpm and Node.js
2. Runs `pnpm install --frozen-lockfile` from the repo root
3. Runs `pnpm --filter @workspace/fast-food-survey run build` with the Supabase env vars injected
4. Uploads the built output (`artifacts/fast-food-survey/dist/public`) to Azure SWA
5. On pull requests, deploys to a temporary staging URL; closes it when the PR is merged

The `staticwebapp.config.json` in the `public/` folder handles client-side routing by rewriting all paths to `index.html`, which is required for React Router to work correctly.

---

## Project Structure

```
.github/
└── workflows/
    └── azure-static-web-apps.yml    # CI/CD: build + deploy to Azure SWA on push to main

artifacts/fast-food-survey/
├── public/
│   ├── favicon.svg                  # Site favicon
│   ├── opengraph.jpg                # OG image for social sharing
│   └── staticwebapp.config.json     # Azure SWA routing + security headers; rewrites all paths to index.html
├── src/
│   ├── components/
│   │   └── Footer.tsx               # Shared footer: "Survey by Alex Hageman, BAIS:3300 - spring 2026."
│   ├── lib/
│   │   └── supabase.ts              # Supabase client initialised from VITE_SUPABASE_* env vars
│   ├── pages/
│   │   ├── SurveyForm.tsx           # Survey form: 4 questions, validation, Supabase insert, thank-you screen
│   │   └── Results.tsx              # Results page: fetches all rows and renders 4 Recharts charts
│   ├── App.tsx                      # BrowserRouter with routes for / and /results
│   ├── index.css                    # Global CSS — custom properties, Tailwind base, full component styles
│   └── main.tsx                     # React 19 createRoot entry point
├── supabase/
│   └── setup.sql                    # DDL: survey_responses table + RLS INSERT/SELECT policies
├── package.json                     # Workspace package — dependencies and dev scripts
├── tsconfig.json                    # TypeScript config extending tsconfig.base.json
└── vite.config.ts                   # Vite config: React plugin, Tailwind, path aliases; PORT/BASE_PATH optional
```

---

## Changelog

### v1.1.0 — 2026-03-31

- Added GitHub Actions workflow for automated Azure Static Web Apps deployment
- Fixed `vite.config.ts` to make `PORT` and `BASE_PATH` optional (defaults to `3000` and `/`) so production builds succeed outside Replit
- Added security response headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) to `staticwebapp.config.json`
- Updated README with full Azure SWA deployment guide and GitHub Secrets reference

### v1.0.0 — 2026-03-31

- Initial release
- Survey form with four questions and inline validation
- Conditional "Other" factor input with autofocus
- Supabase PostgreSQL integration for storing and reading responses
- Results page with total count, frequency bar chart, chains horizontal bar chart, and regional participation chart
- Responsive single-column layout with `#8A3BDB` accent color
- Azure Static Web Apps routing config
- SQL setup script with RLS policies

---

## Known Issues / To-Do

- [ ] The results page shows a generic error message when the Supabase table does not yet exist — a more helpful "run setup.sql first" prompt would improve first-run experience
- [ ] The survey form does not prevent duplicate submissions from the same browser session, so a respondent could submit multiple times
- [ ] Recharts tooltips on the chains bar chart can overflow the card boundary on narrow viewports
- [ ] No loading skeleton is shown on the results page while data is being fetched — a spinner or placeholder would reduce layout shift

---

## Roadmap

- **Duplicate submission prevention** — track a submission token in `localStorage` to block repeat entries from the same device
- **Admin view** — password-protected page showing raw response table with CSV export
- **More demographic questions** — add age range and income bracket questions to enable richer cross-tabulation in results
- **Animated chart transitions** — use Recharts animation props to make the results page feel more polished on first load
- **Email summary** — optional opt-in field so respondents can receive a link to the results page after submitting

---

## Contributing

Contributions are welcome. Please open an issue before submitting large changes so the scope can be discussed first. All pull requests should pass `pnpm run typecheck` with zero errors.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: describe your change"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a pull request against `main` and describe what your change does and why

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

**Alex Hageman**  
University of Iowa  
BAIS:3300 — Business Analytics and Information Systems, Spring 2026

---

## Contact

GitHub: [github.com/alexhageman](https://github.com/alexhageman)

---

## Acknowledgements

- [Supabase Docs](https://supabase.com/docs) — Row Level Security setup and JavaScript client reference
- [Recharts Documentation](https://recharts.org/en-US/) — bar chart and custom label examples
- [React Router v7 Docs](https://reactrouter.com) — BrowserRouter and `basename` configuration
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs) — utility classes and `@theme` custom properties
- [shields.io](https://shields.io) — README badge generation
- [Vite](https://vite.dev) — fast development server and build tooling
- [Replit](https://replit.com) — cloud development environment and deployment platform
- Claude (Anthropic) — AI assistant used during development for code generation and debugging
