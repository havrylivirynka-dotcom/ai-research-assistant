# AI Research Assistant

AI-powered platform that helps students, researchers and Junior Academy of
Sciences (МАН) participants find, evaluate and use scientific literature
while preparing research papers.

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Next.js Route Handlers + Server Actions
- **Database:** Supabase PostgreSQL (with `pgvector` for the МАН Expert RAG knowledge base)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **AI:** OpenAI Responses API
- **Rate limiting:** Upstash Redis (optional — no-ops if not configured)
- **Deployment:** Vercel

## Features

- Scientific search across OpenAlex, CrossRef, Semantic Scholar, arXiv, PubMed and DOAJ
- AI source evaluation (credibility, relevance, freshness, methodology, recommendation)
- PDF analyzer (summary, findings, strengths/weaknesses, suggested citations)
- Bibliography checker (duplicates, outdated sources, formatting issues)
- AI research assistant chat, including a retrieval-augmented (RAG) МАН Expert mode grounded in official regulation documents
- Research structure generator
- Personal library, project workspaces, usage dashboard, settings

## Local development

### Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli) + Docker (for local Postgres/Auth/Storage)
- An OpenAI API key (required for every AI feature — search, saving articles and browsing work without it)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start local Supabase (Postgres, Auth, Storage) and apply migrations:

   ```bash
   supabase start
   ```

   This prints local API URL and keys — copy them into `.env.local` in the next step.

3. Copy the environment template and fill in your keys:

   ```bash
   cp .env.example .env.local
   ```

   At minimum set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (from `supabase start` output) and `OPENAI_API_KEY`.

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Seeding the МАН Expert knowledge base (RAG)

The МАН Expert chat mode answers only from official regulation documents you ingest. To add one:

```bash
npm run ingest-knowledge-base -- \
  --file "/path/to/regulation.pdf" \
  --title "Title of the regulation" \
  --orderNumber "147" \
  --issuingAuthority "Ministry of Education and Science of Ukraine" \
  --effectiveDate "2021-02-08"
```

This extracts the PDF text, splits it into overlapping chunks tagged with the section heading they came from, embeds each chunk with OpenAI, and stores them in `knowledge_chunks` for retrieval. Requires `OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript, no emit
- `npm run ingest-knowledge-base` — ingest an official regulation PDF into the RAG knowledge base

## Project structure

```
app/            Routes (App Router): marketing, auth, authenticated app, API route handlers
components/     Shared UI (shadcn primitives + marketing/layout components)
features/       Feature modules (projects, search, articles, uploads, bibliography, chat, ...)
lib/            Supabase clients, AI service layer, search-provider adapters, rate limiting
hooks/          Shared React hooks
types/          Shared TypeScript types (including generated Supabase types)
schemas/        Zod schemas
supabase/       SQL migrations
scripts/        One-off ops scripts (e.g. МАН knowledge-base ingestion)
prompts/        AI system prompts, one module per AI feature
```

## Database

All tables, indexes, Row Level Security policies and the `pgvector` setup live in `supabase/migrations/`, applied in order. Every table has RLS enabled — users can only read/write their own data (traced through `projects.user_id` for child tables). The `knowledge_documents` / `knowledge_chunks` tables are readable by any authenticated user but only writable via the service-role ingestion script.

To apply migrations to a fresh Supabase project:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## Deploying to Vercel

1. **Create accounts**: GitHub, Vercel, Supabase, OpenAI (and optionally Upstash for rate limiting).
2. **Supabase project**: create a new project, run `supabase db push` against it (see above) to apply the schema, RLS and storage buckets. Enable the Email and (optionally) Google auth providers in the Supabase dashboard.
3. **Ingest the knowledge base** once against the production database (point `.env.local` at the production Supabase project temporarily, or set env vars inline) using `npm run ingest-knowledge-base`.
4. **Push this repo to GitHub** and import it into Vercel.
5. **Set environment variables in Vercel** (Project Settings → Environment Variables) — see `.env.example` for the full list. At minimum: `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL` (your production URL).
6. **Deploy.** Vercel auto-detects Next.js; no custom build command is needed.
7. **Verify**: registration/login, creating a project, a scientific search, an AI evaluation, a PDF upload, and the МАН Expert chat all work against the deployed environment.

### Security checklist before going live

- `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` are only ever set as server-side environment variables, never `NEXT_PUBLIC_*`.
- RLS is enabled on every table (`supabase/migrations/0002` through `0009`) with explicit `GRANT`s for both `authenticated` and `service_role` (`supabase/migrations/0010_grants.sql`) — recent Supabase projects don't auto-expose new tables, so both are required.
- File uploads are validated server-side by MIME type, size, and magic bytes (not just the client-supplied `Content-Type`).
- AI and search endpoints are rate-limited per user via Upstash (configure `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` in production — without them, rate limiting no-ops).
