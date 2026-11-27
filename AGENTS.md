# Suara Mandara â€” AI Project Guide

> Primary project context and engineering instructions for AI coding agents. Read this document before making changes. Keep it updated when architecture, business rules, or implementation status changes.

## 1. Project Overview

**Project:** MANDARA-VOTING  
**Application name:** Suara Mandara  
**Purpose:** A web-based student election portal for SMK Negeri Bali Mandara.  
**Election period displayed in the UI:** 2026/2027.

Suara Mandara manages student participation, candidate profiles, ballots, and aggregate election results for three organizations:

| ID | Organization | Full name |
|---|---|---|
| `mpk` | MPK | Majelis Perwakilan Kelas |
| `osis` | OSIS | Organisasi Siswa Intra Sekolah |
| `ky` | KY | Komisi Yudisial |

This is an existing application with established election rules and persisted voting data. Preserve its business logic, database compatibility, candidate identities, and visual identity when making changes.

## 2. Technology Stack

- Next.js App Router (16.x)
- React 19
- TypeScript, with strict compiler checking
- Tailwind CSS 4
- Next.js Route Handlers for backend APIs
- Node.js built-in SQLite API (`node:sqlite`, `DatabaseSync`)
- `exceljs` for XLSX imports
- `csv-parse` for CSV imports
- Node.js 22.13.0 or newer

Use the existing package dependencies and conventions. Do not introduce another framework, ORM, database, or state-management library without a clear requirement.

## 3. Project Structure

```text
app/
  api/
    auth/
      login/route.ts
      session/route.ts
    election/
      candidates/route.ts
    votes/route.ts
    admin/
      candidates/route.ts
      results/route.ts
      reset-vote/route.ts
      voters/
        template/route.ts   Admin-only Excel voter template download
        import/route.ts     Admin-only Excel voter import
  page.tsx                 Main student-facing entry point
  admin-dashboard.tsx      Admin dashboard client component
  layout.tsx               Root layout and metadata
  globals.css              Global styling and design system

lib/
  auth.ts                  Session creation and validation
  candidates.ts            Candidate and selection data access
  db.ts                    SQLite initialization and migrations
  election.ts              Election types, IDs, defaults, constants
  voter-import.ts          Admin Excel template constants, normalization, password helper
  schema.sql               SQLite schema

scripts/
  import-students.mjs      CSV/XLSX student importer

data/
  siswa.csv.example       CSV import template

public/
  Static logos, branding assets, and media

.data/
  suara-mandara.sqlite    Local persistent SQLite database (ignored by Git)
```

Path alias: `@/*` maps to the project root.

## 4. Commands

Run commands from the workspace root.

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
```

Development server: `http://localhost:3000`.

Student data import:

```bash
npm run import:siswa -- --dry-run ./data/siswa.csv
npm run import:siswa -- ./data/siswa.csv
npm run import:siswa -- --dry-run "C:\path\to\students.xlsx"
```

There is no dedicated `test` script in the current `package.json`, and no populated project test or specification files were found during the initial project inspection. Do not claim tests have passed unless they have actually been run.

## 5. Election Domain Rules â€” Critical

These rules are application invariants. Never casually simplify or merge them.

### 5.1 MPK: two independent elections

MPK is NOT an ordinary candidate-pair election.

It has two separately configured positions:

1. Ketua MPK â€” candidates from grade 11.
2. Wakil Ketua MPK â€” candidates from grade 10.

Each voter chooses exactly one member for each position. These are separate selections and separate ballot records.

A voter is considered to have completed MPK only after both choices have been recorded. A partially completed MPK election must remain distinguishable from a completed one.

Current configuration constraints enforced by the admin API:

- At least one chair candidate.
- At most 10 chair candidates.
- At least one vice-chair candidate.
- At most 200 total entries across both lists.
- Candidate numbers are integers represented as strings, from 1 to 999.
- Numbers must be unique within each position.
- A member may appear in both position lists. If the same member ID appears in both, their name, photo, vision, and mission must agree.

### 5.2 OSIS and KY: candidate-pair elections

OSIS and KY each use candidate pairs (`paslon`). Each pair contains:

- Candidate for chairman (`name`).
- Candidate for vice chairman (`viceName`).
- Candidate number (`number`).
- Photo (`photoDataUrl`).
- Vision (`vision`).
- Mission (`mission`).

Each organization supports two active pairs by default and can have a third. The allowed active count is 2â€“3.

A voter chooses one pair per organization. Candidate IDs are predefined in `lib/election.ts`; the active count determines which IDs are eligible to receive votes.

### 5.3 Candidate identity and ballot integrity

- Candidate IDs are persistent identifiers, not display labels. Preserve them.
- Candidate names, pair membership, and candidate numbers must not be changed in a way that reassigns existing ballots.
- The admin API rejects changes to OSIS/KY candidate identity or active count after ballots exist.
- MPK membership/name changes are rejected after MPK votes or choices exist.
- Candidate profile information (photo, vision, mission) can still be updated after votes exist.
- Do not reorder or reuse candidate IDs to represent different people after voting starts.
- Default candidate names in `lib/election.ts` are initial seed values. Existing SQLite values take precedence because initialization uses `INSERT OR IGNORE`.

## 6. Grade-Specific Student Flow

The current UI and README distinguish two class flows:

- Grades 10/11: an attendance/participation-oriented flow.
- Grade 12: the normal voting flow.

The distinction must be preserved unless the product owner explicitly changes the rules. Do not assume the class selector alone enforces voting eligibility: the vote API currently validates sessions, organizations, positions, and candidate IDs, but does not independently validate a student's grade level.

The intended organization workflow is MPK, OSIS, and KY. MPK requires both position choices before its participation record is complete.

## 7. Authentication and Sessions

Implementation: `lib/auth.ts` and `app/api/auth/*`.

- Student and admin sessions use the cookie name `suara-mandara-session`.
- Session tokens are generated from cryptographically secure random bytes (32 bytes).
- Only SHA-256 token hashes are stored in SQLite.
- Session lifetime is 12 hours.
- Cookies are HTTP-only, `SameSite=Strict`, path `/`, and secure in production.
- Student sessions are stored in `sessions`; admin sessions are stored in `admin_sessions`.
- Session checks enforce expiration. Student checks also require an active voter record.
- Logout removes the current token from both session tables and deletes the cookie.

### Student password convention

The current student login API expects a four-digit identifier and checks a password equal to that identifier plus one, using `BigInt` arithmetic. Example: `1343` â†’ `1344`.

This is a legacy/simple credential convention, not strong authentication. Do not describe it as secure password hashing or strong student authentication.

Admin authentication uses `ADMIN_PASSWORD` from the local environment. Missing configuration produces a service-unavailable response. Never hardcode or expose the actual admin password.

## 8. Student Identifiers and Importing

Implementation: `scripts/import-students.mjs`, `lib/voter-import.ts`, admin Excel template/import route handlers, `voters`, and `voter_ids` tables.

The database has a canonical voter record and a separate identifier/alias table. A login identifier may therefore differ from the canonical `voters.nis` value.

### CSV

- Headers: `nis,nama` (case-insensitive and whitespace-trimmed).
- NIS values are treated as text to preserve leading zeroes.
- Names are normalized and trimmed.

### XLSX

- Scans worksheets for `NISN/NIS` and `NAMA SISWA` headers.
- Header discovery searches the first 40 rows and first 12 columns.
- Recognized combined identifiers contain a 10-digit NISN and a 4-digit NIS separated by punctuation or whitespace.
- The 10-digit NISN becomes the canonical voter key.
- The 4-digit NIS and concatenated identifier are added as aliases alongside the NISN.

### Admin Excel template and import

The admin dashboard's **Daftar pemilih** section can download `template-pemilih-suara-mandara.xlsx` and upload a filled copy through protected route handlers. The template uses a `Pemilih` worksheet with `Nama`, `NIS`, and `Password` columns, one clearly marked example row, and a `Petunjuk` worksheet. The example row is ignored during import.

- Both endpoints require an admin session.
- Only `.xlsx` files up to 5 MB are accepted; imports are limited to 5,000 student rows.
- NIS must be exactly four digits and is stored as text to preserve leading zeroes.
- The password column is validated against the existing login convention (`NIS + 1`); passwords are not stored or used to replace the login rule.
- The 4-digit NIS becomes the canonical `voters.nis` and its own `voter_ids` alias.
- Reimporting an existing canonical NIS updates the name and sets the record active without removing votes.
- A 4-digit NIS already aliased to a different canonical student is rejected; the importer does not reassign identities.
- In-file duplicate NIS values are rejected. Students absent from the file are not deactivated.

The login API currently accepts exactly four digits, so ensure imported aliases and credential expectations agree. CSV examples containing longer identifiers should not be assumed to work with the current login endpoint without checking this mismatch.

Import behavior:

- `--dry-run` validates and reports without changing SQLite.
- Duplicate identifiers that map to different students are rejected.
- Reimporting the same canonical student updates the name and sets the record active.
- Existing voting records are not intentionally removed by importing an existing student.
- Identifiers are limited to 32 characters; student names are limited to 120 characters.
- The importer does not automatically deactivate students absent from a subsequent import file.

Student data is personal information. Never print, expose, commit, or unnecessarily inspect the live voter roster.

## 9. Database Architecture and Safety

Database location:

```text
.data/suara-mandara.sqlite
```

The database is local to the application server. It is ignored by Git.

Important tables:

| Table | Purpose |
|---|---|
| `voters` | Canonical student records |
| `voter_ids` | Student identifier aliases |
| `sessions` | Student sessions |
| `admin_sessions` | Admin sessions |
| `participation` | Completed organization participation |
| `election_candidates` | Candidate-pair identity and names |
| `election_candidate_details` | Pair photos, vision, and mission |
| `mpk_members` | MPK member identities |
| `mpk_member_positions` | MPK position membership and numbers |
| `mpk_member_details` | MPK profile details |
| `voter_choices` | OSIS/KY choices associated with a voter |
| `ballots` | Aggregate OSIS/KY ballot records |
| `mpk_choices` | MPK selections associated with a voter |
| `mpk_ballots` | MPK aggregate ballot records |
| `election_candidate_counts` | Active OSIS/KY candidate counts |
| `organization_logos` | Organization logos |
| `app_migrations` | One-time migration tracking |

### Database initialization

`lib/db.ts` creates the `.data` directory and initializes SQLite using `lib/schema.sql`. It also seeds default candidates and applies migrations, including the legacy MPK candidate-pair to independent chair/vice ballot migration.

`getDatabase()` caches a `DatabaseSync` connection on `globalThis` and performs additional schema setup/migrations.

**Rules for database changes:**

1. Inspect `lib/schema.sql` and `lib/db.ts` before changing persistence behavior.
2. Use explicit, versioned, idempotent migrations tracked by `app_migrations` when existing databases need changes.
3. Preserve compatibility with existing installed databases, not just fresh installations.
4. Use transactions for multi-step ballot, reset, and candidate updates.
5. Preserve foreign-key relationships and uniqueness constraints.
6. Never manually delete, overwrite, recreate, or reset `.data/suara-mandara.sqlite` unless explicitly authorized.
7. Never run a destructive import, reset, or migration against live voter data as an experiment.
8. Do not commit `.data`, `.env.local`, student CSV files, or real student records.

SQLite is intended for a single application instance with persistent local disk. Do not assume ephemeral hosting storage or multiple independent local database copies will preserve consistent election results.

## 10. Ballot Submission and Privacy

Implementation: `app/api/votes/route.ts`.

- A valid student session is required.
- The organization ID must be one of `mpk`, `osis`, or `ky`.
- MPK requires a valid position (`chair` or `vice`) and a member assigned to that position.
- MPK enforces one choice per voter per position.
- OSIS/KY require a currently active candidate ID and enforce one completed vote per voter per organization.
- Vote writes run inside `BEGIN IMMEDIATE` transactions.
- Aggregate ballot rows contain candidate/position and timestamp, but no voter NIS.
- Separate choice tables associate a voter's selections with their NIS.
- MPK participation is recorded after both position choices exist.

**Privacy warning:** Aggregate ballot tables do not directly identify voters, but `mpk_choices` and `voter_choices` retain voter-to-candidate associations. The system must not be advertised as cryptographically anonymous or as providing a secret ballot. Admin-facing results currently use aggregate ballot counts and participation data, not individual choices.

Avoid adding endpoints or UI that disclose individual voter selections without an explicit, reviewed product and privacy decision.

## 11. Backend API Reference

| Method | Route | Purpose | Access |
|---|---|---|---|
| `POST` | `/api/auth/login` | Student/admin login | Public entry point |
| `GET` | `/api/auth/session` | Read current session | Session cookie |
| `DELETE` | `/api/auth/session` | End current session | Session cookie |
| `GET` | `/api/election/candidates` | Read candidate profiles/configuration | Currently public |
| `POST` | `/api/votes` | Submit a ballot/choice | Student session |
| `PUT` | `/api/admin/candidates` | Save candidate configuration | Admin session |
| `GET` | `/api/admin/results` | Read aggregate results and participation | Admin session |
| `POST` | `/api/admin/reset-vote` | Reset voting records | Admin session |
| `GET` | `/api/admin/voters/template` | Download the Excel voter import template | Admin session |
| `POST` | `/api/admin/voters/import` | Import voters from a completed template | Admin session |

Use the API handlers as the source of truth for server-side validation. Client-side UI restrictions are not a substitute for authorization or validation in route handlers.

## 12. Admin Dashboard

Component: `app/admin-dashboard.tsx`.

It contains three client-side sections:

### Rekap suara

- Total participating voters.
- Aggregate results for MPK, OSIS, and KY.
- Separate MPK chair and vice-chair totals.
- Vote counts and percentages.
- Current leading candidates.
- Manual result refresh.

### Daftar pemilih

- Download an Excel template with `Nama`, `NIS`, and `Password` columns and import a completed template.
- Search by name and known identifier aliases.
- Filter students who have participated or have not participated.
- Distinguish incomplete MPK selections from no participation.
- Show participation status without displaying individual choices.
- Includes a confirmation modal for resetting all voting records.

### Pengaturan kandidat

- Organization logos.
- MPK chair/vice member management.
- OSIS/KY candidate-pair management.
- Photo upload, preview, rotation, crop, zoom, and positioning.
- Vision and mission editing.
- Candidate identity locks after ballots exist.
- Save through the protected admin candidate API.

Photo rules:

- Accepted formats: JPEG, PNG, WebP.
- Maximum 512 KB per image/logo.
- Total encoded candidate photos and organization logos: maximum 10 MB.
- The server validates data URLs, base64 encoding, file signatures, and image sizes.
- Vision maximum: 500 characters.
- Mission maximum: 1,200 characters.

The browser crop editor produces JPEG output and attempts progressively lower quality settings to satisfy the 512 KB limit.

## 13. Current Implementation Gaps â€” Verify Before Assuming

The following findings were observed during the initial code inspection. They describe the inspected source state, not intended product behavior. Re-check the files before relying on them because implementation may change.

1. **Student login UI:** `app/page.tsx` defines `handleLogin`, but the inspected rendered JSX contains no login form or visible invocation of that handler.
2. **Student ballot UI:** The inspected home page displays class and organization selection tiles, but does not render candidate-selection screens or call `/api/votes`. The backend vote endpoint exists.
3. **Admin route wiring:** The home page pushes administrators to `/admin`, but the inspected App Router tree has no `app/admin/page.tsx` route.
4. **Admin dashboard mounting:** `app/admin-dashboard.tsx` exports `AdminDashboard`, but no import/reference to it was found elsewhere under `app/` during inspection.
5. **Grade 10/11 login mismatch:** The home page's current `handleLogin` sends blank NIS/password in the grade 10/11 branch, while the login API requires a four-digit NIS and a password. The intended attendance behavior needs an explicit, consistent design across client and server.
6. **Grade enforcement:** The vote API checks a valid session and ballot data but does not independently enforce grade eligibility.
7. **Individual reset UI:** The reset API supports resetting a specific voter's organization or all choices, but the inspected voter list UI does not expose per-student reset controls. The visible UI exposes the reset-all flow.
8. **README inconsistencies:** Some README statements describe individual choice visibility and reset controls that do not match the inspected current dashboard. The visible dashboard explicitly says individual choices are not displayed.
9. **CSV/login identifier mismatch:** CSV accepts arbitrary text identifiers, but the login route currently requires exactly four digits. XLSX imports add a four-digit NIS alias for the recognized NISN/NIS format.
10. **No populated automated test suite:** No populated `tests/` or `specs/` files were found in the initial inspection.

Do not silently fix these gaps while working on an unrelated task. First establish the intended behavior, preserve election/data invariants, and implement the necessary client and server changes together.

## 14. UI and Design Conventions

The application has an established visual identity. Preserve it when modifying interfaces.

Observed design characteristics:

- Indonesian-language interface and copy.
- Suara Mandara branding and school logos.
- Muted paper/off-white backgrounds.
- Deep green primary color and muted red accent.
- Distinct organization accents: lilac for MPK, green for OSIS, and peach for KY.
- Rounded cards, subtle borders, and restrained shadows.
- Responsive layouts for desktop and mobile.
- Custom animation classes and motion-reduction considerations.
- Candidate profile photography and editorial-style candidate presentation.

Before changing styles, inspect `app/globals.css` and reuse existing design tokens, classes, and patterns. Avoid introducing a disconnected visual system or unnecessary dependencies. Keep Indonesian user-facing terminology consistent.

## 15. Engineering Guidelines for AI Agents

### Before making changes

1. Read this file and the relevant source files.
2. Understand the affected election rules and current database structure.
3. Check existing behavior and callers before changing shared functions or API contracts.
4. Check Git status and avoid overwriting unrelated user changes.
5. Keep changes scoped to the requested task.

### During implementation

- Use TypeScript types from `lib/election.ts` instead of duplicating organization IDs or candidate structures.
- Keep domain rules and validation on the server, even when client controls provide the same validation.
- Use parameterized SQLite statements; never interpolate user-provided values into SQL.
- Wrap logically related database changes in transactions.
- Return appropriate HTTP status codes and safe, user-readable Indonesian error messages.
- Do not log passwords, session tokens, full student records, or sensitive voting data.
- Preserve stable candidate IDs and migration compatibility.
- Handle missing, malformed, and stale sessions explicitly.
- Keep components responsive and accessible, including keyboard focus and dialog semantics.
- Avoid unnecessary refactors of large existing components when a focused change is sufficient.

### After implementation

- Run the most relevant available checks, normally `npm run lint` and `npm run build`.
- Review the final diff for accidental changes to data, configuration, and unrelated files.
- Report checks that were actually run and their real results.
- Update this file if architecture, business rules, scripts, or known implementation gaps changed.

## 16. Sensitive and Protected Files

Treat the following as protected local data/configuration:

- `.env.local` and all real environment files.
- `.data/suara-mandara.sqlite`.
- `data/siswa.csv` and any real student import workbook.
- Any exports or backups containing real voter data.

Never reveal secret values in documentation, logs, commits, or assistant responses. `.gitignore` excludes `.env*`, `.data/`, and CSV files; preserve those protections.

## 17. Source-of-Truth Priority

When documentation and implementation disagree, use this order:

1. Current server-side validation and database constraints for enforced behavior.
2. Current client implementation for behavior actually exposed to users.
3. Existing migration history and persisted database compatibility requirements.
4. README and other project documentation for intended product behavior.

When the desired behavior is ambiguous, document the discrepancy and seek a product decision instead of inventing election rules.
