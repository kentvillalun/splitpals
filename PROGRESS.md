# SplitPals — Progress

A mobile-first PWA for splitting bills with friends. Next.js 16 App Router, Supabase (auth + Postgres), Tailwind v4, framer-motion.

## Completed features

**Auth & Onboarding**
- Animated 3-step onboarding walkthrough with receipt preview
- Google OAuth sign-up (no email/password flow)
- OAuth callback exchanges code for session, upserts profile, routes based on onboarding-completion flag
- Username setup step, "ready" welcome screen with entry CTAs

**Bill creation & editing**
- Full bill builder: name, add/remove people, add/remove priced items per person, optional notes
- Review/confirm sheet before saving; creates bill + persons + items rows in Supabase
- Bill editing: diffs original vs. current persons/items, inserts/updates/deletes accordingly
- Routes to a generated receipt after creation

**History & settlement**
- History list with all/unsettled/settled filter, total-unpaid summary
- History detail: receipt view, edit, delete (cascades to persons/items)
- Per-person "mark as paid" toggle (no bill-level settle-all yet)

**Receipt & sharing**
- Thermal-receipt-style `Receipt` component rendered to PNG via `html-to-image`
- Share whole receipt or a single person's share via Web Share API, with download fallback

**Navigation & shell**
- Bottom nav (Home / Bills / Settings + floating "new bill" button) with haptic feedback
- `DesktopGuard` blocks the app on large screens (mobile-only by design)
- Custom splash/launch screen with iOS-specific animation, routes to onboarding/setup/dashboard based on auth state

**Settings**
- Inline username editing, sign out
- Notifications/dark-mode toggles and Feedback/Terms/Privacy/Delete-account are UI placeholders ("Coming soon")

**Data layer**
- All persistence goes through the Supabase client via a generic `useFetch` hook (table/select/filter/orderBy/limit) — no `/api` routes, Prisma config exists but is unused

**PWA**
- `manifest.json` configured for standalone/portrait install, maskable icons, custom start/scope at `/launch`

## Known gaps / non-functional stubs
- Push notifications and dark mode: toggles exist, no backend/theme wiring
- Feedback, Terms, Privacy, Delete account: placeholder toasts only
- No group "you owe / you're owed" net-balance view across bills

## Next steps
- Decide whether Prisma stays in the stack or should be removed (currently dead config)
- Consider a net-balance summary view if multi-person settle-up becomes a priority
