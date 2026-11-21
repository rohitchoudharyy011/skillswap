# Project memory

## Product intent & audience

- Next.js app with Supabase backend (confirmed).
- App includes authentication (login/signup pages) and user profile/data pages.
- Product purpose and target audience still unspecified.

## Brand personality & voice

- Assistant communicates with user in Hinglish (Hindi/Urdu + English mix).

## Visual design & UX direction

- In-app setup guide component: collapsible, shown when Supabase connection is missing; auto-hides once connection succeeds.
- Setup guide displays 4 steps: top-center database icon → Advanced tab → Connect → choose project & reload page.
- Guide placed on login/signup pages (below error message) and profile/data error screens.
- Links to official Bolt Supabase setup docs included.
- Error-driven UX pattern: app self-documents setup when connection fails.

## Decisions, constraints & rationale

- Framework: Next.js.
- Database provider: Supabase (PostgreSQL with RLS/security policies).
- `.bolt/prompt` contains authoritative global instructions (do not duplicate here).
- Setup guide added so users can resolve missing DB connection without external docs.

## Open questions & assumptions

- Product purpose, target audience, and full feature scope unknown.
- Prior "blank screen" issue may have been resolved by the setup guide addition; status unclear.
- Specific schema/table details not yet documented.
- Top-center database connection control is assumed to be a Bolt template feature.