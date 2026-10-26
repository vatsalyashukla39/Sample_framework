# Implementation Plan — Approved Enhancements (Design v1.0)

**Scope:** REQ-E1, REQ-E2, REQ-E3 (see Traceability)

## Requirements (provisional IDs)
- **REQ-E1**: Runtime API response validation (Zod) at transport boundary
- **REQ-E2**: Standardized API logging + correlation/timing (sanitized)
- **REQ-E3**: Test quality gate improvements (replace placeholder + add negative/health coverage)

## Tasks (ordered, dependency-aware)

### Phase 0 — Planning & setup
- **T0.1 (REQ-E3)** Confirm expected unauthenticated `/secure` behavior (redirect vs 401/denied message). This decision is required before finalizing the UI negative test assertion.

### Phase 1 — REQ-E1: Zod validation
- **T1.1 (REQ-E1)** Add `zod` dependency and update lockfile.
  - Affects: `Sample framework/package.json`, lockfile
- **T1.2 (REQ-E1)** Add schema module(s) for API responses (start with Auth login response).
  - Proposed location: `Sample framework/src/models/schemas/auth.schema.ts`
- **T1.3 (REQ-E1)** Update `ApiClient` to support optional schema validation in the response parse boundary.
  - Affects: `Sample framework/src/api/api.client.ts`
  - Error handling: include schema issues; preserve clear handling for non-JSON 2xx bodies.
- **T1.4 (REQ-E1)** Update `AuthApi.login()` to request a validated response and preserve output mapping `{ token }`.
  - Affects: `Sample framework/src/api/auth.api.ts`

### Phase 2 — REQ-E2: Diagnostics
- **T2.1 (REQ-E2)** Add sanitization helper (redact `password`, tokens, and `Authorization`) and correlation id generator.
  - Proposed location: `Sample framework/src/utils/api-diagnostics.ts`
- **T2.2 (REQ-E2)** Enhance `ApiClient` to:
  - generate correlation id per request
  - measure elapsed time around `ctx.get`/`ctx.post`
  - enrich thrown errors with correlation id + elapsed time
  - optionally log structured diagnostic lines (minimal default: off)
  - Affects: `Sample framework/src/api/api.client.ts`

### Phase 3 — REQ-E3: Test improvements
- **T3.1 (REQ-E3)** Replace placeholder UI test in `Sample framework/tests/ui/dashboard.spec.ts` with a meaningful negative/boundary test aligned to existing page objects.
- **T3.2 (REQ-E3)** Add a minimal health check:
  - Option A (safe): assert env resolves when required vars exist
  - Option B (robust): spawn a node subprocess to assert missing env fails fast

### Phase 4 — Tests, reports, and verification
- **T4.1 (REQ-E1)** Extend API tests to include schema-failure coverage (via response mocking or interception strategy).
- **T4.2 (REQ-E1/E2/E3)** Run locally and capture artifacts:
  - `npm install`
  - `npm run typecheck`
  - `npm test`
  - `CI=1 npm test` (generates JUnit at `reports/junit.xml` per Playwright config)

## Commands
- Install deps: `npm install`
- Install browsers: `npm run install:browsers`
- Run all tests: `npm test`
- Run API project: `npm run test:api`
- Run UI (Chromium): `npm run test:ui`
- Run smoke tests: `npm run test:smoke`
- Open Playwright report: `npm run report`
- CI-style run locally: `CI=1 npm test`

## Rollback plan
- Revert commits related to:
  - Zod validation (REQ-E1)
  - diagnostics utility / ApiClient enrichment (REQ-E2)
  - test replacements (REQ-E3)

## Traceability (summary)
| Req/Story | Tasks | Planned tests |
|---|---|---|
| REQ-E1 / DRAFT-STORY-01 | T1.1–T1.4, T4.1 | API tests: schema happy-path + schema failure via mocked response |
| REQ-E1 / DRAFT-STORY-02 | T1.2, T1.4 | `tests/api/auth.spec.ts` + negative contract test |
| REQ-E2 / DRAFT-STORY-03 | T2.1–T2.2 | Redaction helper test; error includes correlation id + elapsed |
| REQ-E3 / DRAFT-STORY-04 | T0.1, T3.1–T3.2 | Replace placeholder UI test; add unauthenticated `/secure` behavior test |
