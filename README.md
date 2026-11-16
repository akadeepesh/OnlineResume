![OnlineResume](https://github.com/user-attachments/assets/8e07beea-7e50-4383-810f-b54d6e090b4e)

# OnlineResume

**Your resume, as a link.** Write it or import it, pick a design, and share one URL that always shows the latest version. Export a PDF whenever someone asks for a file.

Built for everyone who needs a resume, not just developers: sign in with email, Google or GitHub.

## Features

**Available now**
- **Section-by-section editor** with a live preview, undo/redo, autosave, and sections you can reorder or hide.
- **Five templates** rendered from one validated schema, so your content works in every design.
- **Guest mode:** start writing without an account. Your draft is kept in the browser.
- **Accounts** with email + password, Google or GitHub.
- **Your own username**, which becomes your public link.

**In progress**
- Dashboard with several resumes per account, saved to the database.
- Public pages at `/<username>`, with publish and search-engine visibility controls.
- PDF and JSON export.
- Import from PDF, DOCX, JSON Resume and LinkedIn, keeping the original file for download.

## Templates

Every template takes the same data ([`src/lib/resume/schema.ts`](src/lib/resume/schema.ts)). Previews use the fictional sample in [`src/lib/resume/sample.ts`](src/lib/resume/sample.ts).

| Template    | Style                                                                 |
| ----------- | --------------------------------------------------------------------- |
| `classic`   | Light sidebar profile with clean content cards and a timeline         |
| `editorial` | Print-inspired serif CV on paper, numbered sections, inline expansion |
| `spotlight` | Dark split-screen, sticky nav that tracks the section, cursor glow    |
| `terminal`  | Interactive shell: visitors can type `help`, `skills python`, …       |
| `bento`     | Modern tile grid with stats, accordion experience and skill drawer    |

Preview any of them at `/templates/<name>`, e.g. `/templates/bento`.

To add a template, create `src/templates/<name>/` with a component that takes `{ data: Resume }`, then register it in [`src/templates/meta.ts`](src/templates/meta.ts) and [`src/templates/index.ts`](src/templates/index.ts).

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router), React, TypeScript |
| UI | Tailwind CSS, shadcn/ui (Radix), Framer Motion, dnd-kit |
| State & validation | zustand, zod |
| Data | Neon Postgres, Drizzle ORM |
| Auth | Better Auth |
| Tests | Vitest, Testing Library |

## Getting started

Requires Node.js 20 or newer.

```bash
git clone https://github.com/akadeepesh/OnlineResume.git
cd OnlineResume
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The editor and templates work with no configuration.

**Accounts and saved resumes** need a Postgres database (a free [Neon](https://neon.tech) project works):

1. Set `DATABASE_URL` in `.env.local`.
2. Run `npm run db:migrate`.
3. Optional: set `GOOGLE_*` / `GITHUB_*` to show those sign-in buttons. Email + password works without them.

Every variable is described in [`.env.example`](.env.example) and validated at startup in [`src/lib/env.ts`](src/lib/env.ts).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Unit tests (Vitest) |
| `npm run db:generate` | Create a SQL migration from schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:studio` | Browse the database |

## Project structure

```
src/
  app/            routes: editor, templates, sign-in/up, onboarding, dashboard, API
  components/     editor, auth and shared UI
  lib/resume/     resume schema, migrations, sample data
  lib/store/      editor state, undo/redo, local draft
  lib/db/         database schema and client
  lib/auth/       auth config, session helpers
  templates/      the five resume designs
drizzle/          SQL migrations
```

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow and [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

[MIT](LICENSE)

## Contributors

<a href="https://github.com/akadeepesh/OnlineResume/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=akadeepesh/OnlineResume" alt="Contributors" />
</a>

---

<p align="center"><sub>
  Built by <a href="https://akadeepesh.com?ref=github">Deepesh Kumar</a> · more work at <a href="https://akadeepesh.com?ref=github">akadeepesh.com</a>
</sub></p>
