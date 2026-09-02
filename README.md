# MET Proficiency Platform

AI-powered MET (Michigan English Test) preparation for nurses and healthcare professionals. Diagnosis, homework assignment, feedback cycles, mock tests, exercises, and speaking/writing evaluation — with teacher and student dashboards.

## Stack

- React 19 + Vite 6, Tailwind-ready (custom CSS token system in `src/styles/`)
- Express server (`server.ts`) with API handlers in `api/` (AI, TTS, submissions, invite)
- Supabase Postgres (data) + localStorage fallback (`src/lib/workflow.js`)
- Multi-provider AI cascade (Gemini, OpenAI, Anthropic, Groq, OpenRouter)
- PWA via `vite-plugin-pwa`

## Run locally

1. `npm install`
2. Set keys in `.env.local` (see `.env.example`)
3. `npm run dev` — Vite dev server, API proxied to localhost:3000

## Production

`npm run build` then `npm start`, or deploy via Netlify (see `DEVOPS.md`).

## Tests & checks

- `npm test` — smoke tests
- `npm run lint` — ESLint (warnings as errors)
- `npm run typecheck` — `tsc --noEmit`
