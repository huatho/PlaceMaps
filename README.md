# AI-Powered ORM Dashboard

MVP frontend for an AI-assisted review management dashboard built with Next.js App Router, TypeScript, and Tailwind CSS.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`.

## Environment

Set these variables locally in `.env.local` and in your deployment platform:

```env
SUPABASE_URL=
SUPABASE_API_KEY=
GOOGLE_PLACES_API_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

## Structure

- `app/` contains App Router pages and API routes.
- `components/dashboard/` contains dashboard-specific UI.
- `components/ui/` contains reusable primitives.
- `lib/` contains Google Places, Gemini, Supabase, and utility helpers.
- `types/` contains shared TypeScript contracts.
- `constants/` contains app-level constants.

## API Routes

- `GET /api/health`
- `POST /api/reviews/fetch`
- `POST /api/reviews/:id/generate-ai`
- `POST /api/reviews/:id/approve`
