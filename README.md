# Vibe-Founding Tool — PSF MVP

Problem-Solution Fit hypothesis testing for early founders.

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY

# Run database migrations
npx drizzle-kit generate
npx tsx src/lib/db/migrate.ts

# Start dev server
npm run dev
```

## Tech Stack

- **Framework:** Next.js 15 (App Router) + TypeScript + React 19
- **Database:** SQLite via better-sqlite3 + Drizzle ORM
- **AI:** Anthropic Claude API
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Validation:** Zod

## Project Structure

```
src/
├── app/           # Next.js App Router pages + API routes
├── components/    # React components (ui/, shared/, feature-specific/)
├── hooks/         # Custom React hooks
└── lib/           # Server-side logic
    ├── db/        # Drizzle schema + client
    ├── jobs/      # Background job queue + handlers
    ├── ai/        # Anthropic SDK client
    ├── schemas/   # Zod validation schemas
    ├── audio/     # Transcription integration
    └── export/    # PDF + Markdown generation
```

## CI

```bash
bash scripts/ci.sh
```

Runs: shellcheck, markdown lint, secret detection, TypeScript type-check, ESLint, Next.js build.
