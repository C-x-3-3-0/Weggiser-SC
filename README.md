# Weggiser SC – Website & Matchday Monitor

Source code for **[weggisersc.ch](https://www.weggisersc.ch)**, the website of the Weggiser Sportclub (WSC), and for the **matchday TV monitor** in the clubhouse.

| Part | What it does |
|---|---|
| Website | Public club website: news, teams, Verein, Weiherstübli, Arena, sponsors, archive |
| Monitor (`/monitor`) | Full-screen page for the on-site TV. During a matchday it shows each game's kick-off time, the home and away teams, the pitch (Thermoplan Arena / Black&White Arena) and the changing room for each team |

Both live in **one Astro project**, with one build and one deploy.

---

## Tech stack

- **[Astro](https://astro.build) + TypeScript**: static site generator, built on Vite
- **Content** as Markdown files with typed frontmatter (Astro Content Collections)
- **Monitor**: an Astro page with a small client-side TypeScript script that reloads `matchday.json`
- **Fixtures**: IFV Matchcenter, club ID `381`, fetched by a Node/TypeScript script
- **Hosting**: our own server, serving the built static files through Caddy (or nginx)
- **CI/CD**: GitHub Actions, which builds and deploys on every push to `main`

## Project structure

```
.
├── src/
│   ├── content/              # ✏️ Edit these: all site content as Markdown
│   │   ├── news/
│   │   ├── teams/
│   │   └── vorstand/
│   ├── content.config.ts     # Schemas for the content (title, date, image …)
│   ├── pages/                # Routes: file name = URL
│   │   ├── index.astro       # /
│   │   ├── aktuelles/
│   │   ├── mannschaften/
│   │   ├── verein/
│   │   ├── arena.astro
│   │   └── monitor.astro     # /monitor (TV screen)
│   ├── components/           # Header, Footer, TeamCard, SponsorStrip, MatchRow …
│   ├── layouts/              # BaseLayout (site), MonitorLayout (full-screen TV)
│   └── styles/               # Global styles, club colours
├── public/
│   ├── images/               # Photos, logos
│   ├── files/                # PDFs and documents
│   └── data/
│       ├── garderoben.json   # Changing rooms and default assignments
│       └── matchday.json     # Generated: today's games (do not edit by hand)
├── scripts/
│   └── fetch-matchday.ts     # Pulls today's home games from IFV Matchcenter
├── deploy/                   # Caddyfile, systemd timer for the fetch script
├── .github/workflows/        # Build and deploy
├── astro.config.mjs
└── package.json
```

## Getting started

Requirements: **Node.js 20+** and Git. VS Code with the official **Astro extension** is recommended.

```bash
git clone git@github.com:<org>/weggisersc.git
cd weggisersc
npm install
npm run dev          # http://localhost:4321
```

The monitor runs locally at `http://localhost:4321/monitor`.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with live reload |
| `npm run build` | Builds the static site into `dist/` |
| `npm run preview` | Serves the `dist/` build locally to check it |
| `npm run check` | Type-checks `.astro` and `.ts` files |
| `npm run fetch:matchday` | Fetches today's games into `public/data/matchday.json` |

## Editing content

Most changes do not need any code:

| I want to … | Edit |
|---|---|
| Post news | Add a `.md` file in `src/content/news/` |
| Change a team's coaches or photo | `src/content/teams/<team>.md` |
| Update the Vorstand | `src/content/vorstand/` |
| Add a PDF or image | Drop it into `public/files/` or `public/images/` |
| Change the changing-room plan | `public/data/garderoben.json` |

A news post looks like this:

```md
---
title: Rückblick Vorrunde 2025/26
date: 2026-10-18
image: /images/news/vorrunde-25-26.jpg
---

Text der Meldung …
```

If a required field is missing or has the wrong type, `npm run build` fails and tells you which file is wrong.

## New to Astro? (coming from Angular)

| Angular | Astro |
|---|---|
| `component.ts` + `.html` + `.css` | One `.astro` file: a `---` script block, then HTML, then `<style>` |
| `@Input()` | `const { team } = Astro.props;` |
| `*ngFor` / `@for` | `{teams.map(t => <TeamCard team={t} />)}` |
| `*ngIf` / `@if` | `{show && <p>…</p>}` |
| `{{ value }}` | `{value}` |
| Router config | File-based: `src/pages/arena.astro` → `/arena` |
| Runs in the browser | The `---` block runs **at build time only**. For browser code, use a `<script>` tag |
| Component styles | `<style>` in a component is scoped automatically |

Example component:

```astro
---
interface Props { name: string; coaches: string[] }
const { name, coaches } = Astro.props;
---
<article class="team">
  <h3>{name}</h3>
  <p>{coaches.join(', ')}</p>
</article>

<style>
  .team { border-left: 4px solid var(--wsc-black); }
</style>
```

Docs: https://docs.astro.build

## Workflow (2 developers)

1. Pull the latest changes: `git pull`
2. Create a branch: `git checkout -b news/chlausturnier`
3. Make the change, then check it with `npm run dev` and `npm run check`
4. Push and open a Pull Request. The other developer reviews it.
5. Merge into `main`. The site **builds and deploys automatically**.

`main` is always what is live. Do not push directly to `main`.

## Deployment

On every push to `main`, GitHub Actions:

1. runs `npm ci && npm run check && npm run build`
2. copies `dist/` to the server over SSH (`rsync`)

During the redesign, the new site runs on a preview subdomain (e.g. `neu.weggisersc.ch`) while the current Wix site stays live. We switch the DNS once the new site is ready.

Required repository secrets: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PATH`.

## Matchday monitor

- `scripts/fetch-matchday.ts` runs **on the server** every 15 minutes on matchdays (systemd timer, see `deploy/`). It writes `matchday.json` straight into the live web folder, so the TV gets new data without a rebuild or deploy.
- Changing rooms come from `garderoben.json`. They can be overridden per game.
- The TV opens `https://www.weggisersc.ch/monitor` in kiosk/full-screen mode. The page reloads its data every minute.
- If the fetch fails, the screen keeps showing the last good data and its timestamp.

## Notes

- Junior team photos show minors: only publish photos covered by a signed *Einverständniserklärung*.
- Old Wix URLs (e.g. `/kopie-von-aktive`) get redirects to the new clean slugs. See `deploy/Caddyfile`.

## Maintainers

- Hao Wang
- Pascal Huber

Questions about content: info@weggisersc.ch
