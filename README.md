# Devora

**Your developer command center.** Devora brings practical coding utilities and personal developer workflows into one privacy-conscious web app.

## Start using Devora

### Run locally

Requirements: Node.js 20.9 or newer, npm, and Docker Desktop (for the local PostgreSQL database).

```bash
git clone https://github.com/Vishvasdhama11/devora.git
cd devora
npm ci
cp .env.example .env.local
```

Set `NEXTAUTH_SECRET` in `.env.local` to a locally generated value:

```bash
openssl rand -base64 32
```

The default database URL in `.env.example` should match the PostgreSQL service in `docker-compose.yml`. Start the database, generate the Prisma client, and sync the development schema:

```bash
npm run db:dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To run the database setup and web server with one command instead, use `npm run dev:full`.

Most tools are available without an account. Create an account to use the protected dashboard and save personal favorites, activity, workspaces, and preferences.

## Features

### Developer tools

The tool catalog is driven by one registry and includes:

- **JSON:** format and validate JSON; convert it to TypeScript.
- **Data:** convert JSON object arrays to CSV and CSV tables back to JSON.
- **Regex:** test patterns, highlight matches, and start from templates.
- **Encoding:** encode/decode Base64, URL-safe strings, and HTML entities.
- **API:** send HTTP requests, inspect responses, and keep local request history.
- **CSS and colors:** convert HEX, RGB, and HSL values; create CSS variables.
- **URLs:** inspect URL parts and build query strings.
- **Security utilities:** generate UUIDs, SHA-256 hashes, and strong random passwords; decode JWT headers and payloads without verifying signatures.
- **Images:** convert local PNG, JPEG, WebP, GIF, AVIF, and BMP files into Base64 Data URLs in your browser.
- **Formatting:** write and preview Markdown.
- **Time:** convert Unix timestamps, dates, and time zones.
- **Git:** generate common Git commands for everyday workflows.

Use the home-page search or press **Cmd/Ctrl + K** to find a tool.

### Personal workspace

After signing in, users can:

- Search and open developer tools from a personalized dashboard.
- Jump to frequently used tools, recent workspaces, favorites, and account activity.
- Manage projects with status, progress, tech stack, deadlines, and repository/demo links.
- Create project-linked tasks, set priorities and due dates, filter open, overdue, and completed work, and see deadlines in the calendar agenda.
- Write searchable Markdown/plain-text notes in folders; pin, favorite, tag, and attach them to projects.
- Save HTTP(S) reference bookmarks with descriptions and tags.
- Manage workspaces, including create, edit, duplicate, and delete.
- Save and remove favorite tools.
- Review recent activity, including workspace, favorite, and settings changes.
- Set theme, default view, notification preference, and compact mode.

Personal workspace, favorite, activity, and preference data is stored in PostgreSQL and scoped to the signed-in user. Many utilities process data in the browser; avoid submitting sensitive content to tools that make network requests, such as the API tester.

When updating an existing development database with the project, run `npm run db:dev` to apply the additive productivity schema changes. This development command uses `prisma db push` and does not create migration history. For new or already migration-managed production databases, apply migrations with `npx prisma migrate deploy`. If a production database was previously managed with `db push`, verify and baseline its existing schema before deploying migrations; do not apply the initial migration as though the database were empty.

The image-to-Data-URL tool works locally and does not upload files. Its output embeds the image in HTML or CSS; it is not a publicly hosted or shareable image link.

### CLI and VS Code

The monorepo includes early CLI and VS Code extension integrations:

- CLI commands can list tools, print a tool route, and manage local workspace JSON.
- The extension can open the dashboard or tools and save a workspace entry when a project folder is open.

These are local integration foundations, not published marketplace/npm releases. The CLI and extension workspace entries are local files; they do not currently sync to the web app's PostgreSQL workspaces.

## Database workflow

The development PostgreSQL service is defined in `docker-compose.yml`.

```bash
npm run db:up       # Start PostgreSQL
npm run db:generate # Generate Prisma client
npm run db:push     # Sync Prisma schema to the development database
npm run db:studio   # Open Prisma Studio
npm run db:down     # Stop services
```

`npm run db:dev` combines database startup, client generation, and `prisma db push`. For migration-based development, run `npm run db:migrate`; Prisma will create/apply a migration as needed. `npm run db:reset` is destructive: it drops and recreates the development database schema and data.

## Environment

Copy `.env.example` to `.env.local` and set values for your environment:

| Variable                                   | Purpose                                                            |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `DATABASE_URL`                             | Prisma PostgreSQL connection string                                |
| `POSTGRES_URL`                             | PostgreSQL connection string for compatible hosting environments   |
| `NEXTAUTH_URL`                             | Base URL of the app, usually `http://localhost:3000` locally       |
| `NEXTAUTH_URL_INTERNAL`                    | Internal app URL used by the auth setup                            |
| `NEXTAUTH_SECRET`                          | Secret used to sign/authenticate sessions; generate a unique value |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Optional GitHub OAuth credentials                                  |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google OAuth credentials                                  |

Keep `.env.local` private and never commit real credentials. Email/password registration and sign-in use the local database; OAuth providers require their corresponding credentials.

### Enable GitHub sign-in

Create a GitHub OAuth App and set its **Authorization callback URL** to:

```text
http://localhost:3000/api/auth/callback/github
```

Copy the OAuth App's client ID and client secret into `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env.local`, then restart the development server. For a deployed app, register the matching production callback URL (`https://your-domain/api/auth/callback/github`) and use the production OAuth credentials. The GitHub button appears when both credentials are configured.

## Useful commands

| Command             | Description                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| `npm run dev`       | Start the Next.js development server                                   |
| `npm run dev:full`  | Start local PostgreSQL, sync the development schema, and start the app |
| `npm run build`     | Create a production build                                              |
| `npm run start`     | Serve the production build                                             |
| `npm run test`      | Run Vitest                                                             |
| `npm run lint`      | Run ESLint                                                             |
| `npm run typecheck` | Run TypeScript checks                                                  |
| `npm run db:studio` | Inspect database records with Prisma Studio                            |

## Monorepo packages

- `packages/devora-cli` — CLI source and commands. From the repository root, run `node packages/devora-cli/bin/devora.js help`.
- `packages/vscode-extension` — VS Code extension source. Open this folder in VS Code and press **F5** to launch an Extension Development Host.

## Project structure

```text
src/
  app/          Next.js pages, protected surfaces, and API routes
  components/   Shared UI and interactive tool components
  lib/          Auth, Prisma, and shared helpers
  tools/        Registry and tool implementations
packages/
  devora-cli/
  vscode-extension/
prisma/         Database schema
```

## Contributing

Add new web tools through `src/tools/registry.ts` so they appear consistently in tool routes, search, and categories. Before submitting changes, run:

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidance.

## License

MIT
