# Claude Code Guide â€” Suara Mandara

> Start here when working on this repository with Claude Code. `AGENTS.md` is the authoritative, detailed project guide. Read it before investigating or changing application code.

## 1. First Steps

1. Read `AGENTS.md` completely for project architecture, business rules, database design, security constraints, and current implementation gaps.
2. Read `README.md` for setup instructions and documented product behavior.
3. Inspect the relevant source files before proposing or applying changes.
4. Check `git status` before editing. Preserve existing user changes and local data.
5. Keep changes focused on the requested task.

Do not assume the README describes the exact behavior currently implemented. `AGENTS.md` records discrepancies discovered during source inspection; verify them against the current code before relying on them.

## 2. What This Project Does

**Suara Mandara** (`MANDARA-VOTING`) is a Next.js student election portal for SMK Negeri Bali Mandara. It handles three organization elections:

- **MPK:** independent election for Ketua MPK (grade 11 candidates) and Wakil MPK (grade 10 candidates). Both selections are required for completed MPK participation.
- **OSIS:** one selected candidate pair (paslon).
- **KY:** one selected candidate pair (paslon).

The application uses Next.js App Router, React 19, TypeScript, Tailwind CSS 4, Node.js SQLite, and CSV/XLSX student importing. The local SQLite database is `.data/suara-mandara.sqlite`.

## 3. Non-Negotiable Domain Rules

- Never treat MPK as a single candidate-pair election. Chair and vice-chair ballots are separate.
- Never accept more than one choice per voter for the same MPK position or OSIS/KY organization.
- MPK participation is complete only when both chair and vice-chair choices exist.
- OSIS and KY allow 2â€“3 active candidate pairs. Respect the active candidate count and stable candidate IDs in `lib/election.ts`.
- Candidate identity, membership, and numbering must not be reassigned after ballots exist. Existing server-side checks enforce these restrictions.
- Candidate photos, vision, and mission may be updated without changing candidate identity, subject to server validation.
- Preserve the distinction between the documented grade 10/11 participation flow and grade 12 voting flow. Do not invent grade eligibility rules.
- Preserve historical ballot records and existing database compatibility.

For the full rules and edge cases, see `AGENTS.md`, especially sections 5â€“10.

## 4. Architecture at a Glance

```text
app/
  page.tsx                       Student-facing entry point
  admin-dashboard.tsx            Admin dashboard component
  layout.tsx                     Root layout
  globals.css                    Global styles
  api/auth/login/route.ts         Login
  api/auth/session/route.ts       Session and logout
  api/election/candidates/route.ts Candidate data
  api/votes/route.ts              Vote submission
  api/admin/candidates/route.ts   Candidate administration
  api/admin/results/route.ts      Aggregate results
  api/admin/reset-vote/route.ts   Vote reset operations

lib/
  auth.ts                         Session and authentication logic
  candidates.ts                   Candidate data access
  db.ts                           SQLite setup and migrations
  election.ts                     Election IDs and TypeScript types
  schema.sql                      Database schema

scripts/import-students.mjs       CSV/XLSX student importer
```

The `@/*` TypeScript alias points to the repository root.

## 5. Important Files to Read Before Editing

| Task | Read first |
|---|---|
| Election rules or candidate types | `lib/election.ts` |
| Database schema or migrations | `lib/schema.sql`, `lib/db.ts` |
| Login or session behavior | `lib/auth.ts`, `app/api/auth/` |
| Candidate retrieval | `lib/candidates.ts`, `app/api/election/candidates/route.ts` |
| Ballot submission | `app/api/votes/route.ts` |
| Candidate management | `app/admin-dashboard.tsx`, `app/api/admin/candidates/route.ts` |
| Results and participation | `app/admin-dashboard.tsx`, `app/api/admin/results/route.ts` |
| Vote reset | `app/admin-dashboard.tsx`, `app/api/admin/reset-vote/route.ts` |
| Student data importing | `scripts/import-students.mjs`, `lib/schema.sql` |
| Visual changes | `app/globals.css`, relevant component |

## 6. Security and Data Handling

Treat these files as sensitive local resources:

- `.env.local` and other real environment files.
- `.data/suara-mandara.sqlite`.
- `data/siswa.csv` and real student workbooks.
- Database backups and student exports.

Never expose passwords, tokens, real student records, or individual voting selections in logs, documentation, commits, or responses.

Authentication uses random 32-byte session tokens, SHA-256 token hashes stored in SQLite, HTTP-only cookies, and a 12-hour session lifetime. Student passwords currently follow the predictable NIS + 1 convention; do not describe this as strong authentication. The admin password comes from `ADMIN_PASSWORD`; never hardcode it.

The database retains voter-to-choice relationships in `mpk_choices` and `voter_choices`, even though aggregate ballot tables do not contain voter identities. Do not claim the system provides cryptographic anonymity or a secret ballot.

For database work:

- Use parameterized SQL statements.
- Use transactions for related writes and resets.
- Add versioned, idempotent migrations for schema changes.
- Preserve foreign keys, unique constraints, candidate IDs, and existing data.
- Never delete, recreate, reset, or overwrite the live SQLite database without explicit authorization.
- Do not commit `.env.local`, `.data/`, real CSV data, or student workbooks.

## 7. Known Implementation Gaps to Verify

The following discrepancies were found during the initial repository inspection. Check the latest source before acting on them:

1. `app/page.tsx` defines a login handler, but its inspected JSX does not render a login form or invoke that handler.
2. The inspected student page displays organization tiles but no candidate ballot interface and no call to `/api/votes`.
3. The home page redirects an admin to `/admin`, but the inspected App Router tree has no `app/admin/page.tsx`.
4. `app/admin-dashboard.tsx` exports a substantial `AdminDashboard` component, but no other file under `app/` was found importing or rendering it.
5. The grade 10/11 login branch sends blank credentials, while the login API requires a four-digit identifier and password.
6. The vote API validates sessions and ballot data but does not independently enforce grade eligibility.
7. The reset API supports individual student resets, but the inspected voter list UI only exposes reset-all functionality.
8. Some README statements about individual choice visibility and reset controls differ from the inspected dashboard. The visible dashboard shows participation status and aggregate results, not each voter's choice.
9. CSV import accepts text identifiers, but the login API currently requires four digits. Check identifier aliases when changing the importer or login flow.
10. No populated automated test or specification files were found in the initial inspection.

Do not silently resolve these discrepancies as part of unrelated tasks. Establish intended behavior and make coordinated client/server changes when requested.

## 8. Development Commands

Node.js 22.13.0 or newer is required.

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
```

Student import:

```bash
npm run import:siswa -- --dry-run ./data/siswa.csv
npm run import:siswa -- ./data/siswa.csv
npm run import:siswa -- --dry-run "C:\path\to\students.xlsx"
```

The current `package.json` has no dedicated test script. Do not report tests as passing unless a real test command was run.

## 9. Claude Code Working Rules

When implementing a request:

1. Explain the relevant existing behavior briefly before changing complex election or persistence logic.
2. Inspect callers, route handlers, types, and database constraints before modifying shared behavior.
3. Make the smallest complete change that satisfies the request. Avoid unrelated refactors.
4. Keep server-side validation and authorization authoritative; frontend validation is supplementary.
5. Follow existing Indonesian terminology and the established Suara Mandara visual language.
6. Keep the UI responsive and accessible. Respect keyboard navigation, focus states, semantic controls, and reduced-motion preferences.
7. Never invent candidate data, election rules, voter identities, or secret configuration values.
8. Do not run destructive database operations or broad formatting/rewrite operations without explicit authorization.
9. Run `npm run lint` and `npm run build` when relevant and report their actual outcomes.
10. Review the final diff and summarize changed files, behavior, checks, and any remaining caveats.

## 10. Documentation Maintenance

`AGENTS.md` is the canonical detailed project guide. When architecture, business rules, routes, scripts, database behavior, or implementation gaps change:

- Update `AGENTS.md` with verified current information.
- Update this file only when Claude-specific workflow guidance or its quick reference becomes inaccurate.
- Keep `README.md` focused on human-facing setup and user documentation.
- Never put real secrets or personal student data in any documentation file.
