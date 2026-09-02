# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + Supabase (existing codebase)

## Users

Primary: **Nurses and healthcare professionals** preparing for the Michigan English Test (MET) — the students.
Secondary: **One teacher** (the product owner) managing the diagnostic → homework → feedback workflow for their students.

## Product Purpose

A teacher-run MET prep platform that closes the loop: **diagnose → assign targeted homework → review submissions → give feedback**. The teacher owns the workflow; students receive structured practice with AI-assisted evaluation.

Success = students improve MET scores through the teacher's guided cycle; teacher saves time on grading and diagnosis.

## Positioning

The only MET prep tool built around a **single teacher's diagnostic–homework–feedback workflow** for healthcare professionals. Neighboring products offer generic question banks or self-study; this product makes the teacher's expert loop the core mechanism.

## Operating Context

- Teacher creates diagnostics (assessments) for students
- Students complete diagnostics → teacher reviews → assigns targeted homework
- Students submit homework (writing, speaking) → teacher reviews with AI assistance → gives feedback
- Spaced-repetition review schedule for student errors
- Mock tests (full MET simulations) for practice
- Teacher dashboard shows "Today" view with workflow stages and pending submissions
- Student dashboard shows assigned work, progress, and mock test access

## Capabilities and Constraints

**Confirmed:**
- React + Vite + Supabase (auth, database, realtime)
- Teacher auth via allowlisted emails; student auth via roster claim-by-email
- Diagnostics: reading, listening, writing, speaking sections
- Homework: writing and speaking assignments with AI evaluation
- Submissions: teacher review UI with rubric, audio playback, AI suggestions
- Mock tests: full MET simulations with timer, section navigation
- Spaced repetition: error bank with review scheduling
- Command palette (⌘K) for teacher navigation
- Dark/light theme with persistence

**Constraints:**
- Single-teacher deployment (no multi-tenant teacher support yet)
- Supabase project required for auth/db/realtime
- No native mobile apps (web only)

## Brand Commitments

- **Name:** MET Mastery (from index.html title)
- **Logo:** MET logo at `/dist/images/met-logo.png` and favicon.svg
- **Fonts:** DM Sans (UI), Cormorant Garamond (display/serif), Space Mono (code/mono)
- **Primary color:** Teal `#01796F` (--primary)
- **Voice:** Professional, clinical precision, encouraging but not playful

## Evidence on Hand

- Two full mock tests with audio assets (listening sections)
- MET framework core competencies documentation
- B2 vocabulary homework bank
- Speaking picture prompts (4 scenarios with images)
- Writing rubrics and sample responses
- Teacher evaluation workflows implemented

## Product Principles

1. **Teacher workflow first** — every feature serves the diagnose → homework → feedback loop
2. **Healthcare context** — content and language reflect nursing/healthcare professional scenarios
3. **AI as assistant, not replacement** — AI evaluates and suggests; teacher decides and teaches
4. **Visible progress** — students and teacher see concrete improvement signals
5. **Calm, clinical UI** — low visual noise, high information density where needed

## Accessibility & Inclusion

- WCAG 2.2 AA target
- Keyboard navigation for all teacher workflows
- Screen reader support for student test-taking
- High contrast mode via dark/light theme
- Audio transcripts for listening sections