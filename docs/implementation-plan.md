# Implementation Plan — Design v1.0 (draft)

## 0) Overview

### Goals
Enhance the Playwright + TypeScript automation framework with:
- **REQ-1**: API boundary schema validation (starting with `POST /auth/login`) using **zod**
- **REQ-2**: Standard tagging + profiles/projects to support suite gating (smoke/regression/api/ui)
- **REQ-3**: Improved reporting and test artifacts (HTML/JUnit + traces/videos/screenshots) for faster debugging

### Non-goals (explicitly out of scope)
- Application code changes (backend/frontend)
- CI/CD pipeline and environment provisioning changes
- Jira/ALM workflow changes

### Baseline / Assumptions
- Branch: `main` (exact commit unknown due to tooling limitation)
- Framework: Playwright test runner + TypeScript
- Key areas likely impacted by the plan: `playwright.config.ts`, `src/api/*`, `tests/setup/*`, `tests/api/*`, `tests/ui/*`, README/package scripts

---

## 1) Requirements Mapping

### REQ-1 — API boundary validation with zod
**Intent:** Ensure the framework fails fast when API contracts change, and provide actionable error messages.
**Starting point:** `POST /auth/login` response validation before mapping `accessToken -> token`.

### REQ-2 — Tagging conventions + profiles (suite gating)
**Intent:** Make it easy to run subsets reliably using:
- tags (e.g., `@smoke`, `@regression`)
- profiles/projects (API vs UI; optionally “smoke” vs “full” configurations)

### REQ-3 — Reporting & artifacts
**Intent:** Improve diagnostics with standard reports and consistent artifact retention:
- HTML report for local debugging
- JUnit for CI integration (even if CI changes are out-of-scope, the framework should be ready)
- Traces/screenshots/videos collected per policy, with sensible defaults and overrides

---

## 2) Task Breakdown (T0.1 – T3.2)

### T0.1 — Align on conventions and add design notes
- Confirm tag taxonomy and usage patterns (see REQ-2)
- Decide artifact retention policy for local vs CI runs (see REQ-3)
- Document the “contract validation strategy” for API (REQ-1)

**Deliverable:** Updated implementation plan/design notes (this document).

### T0.2 — Add/confirm dependencies and scripts (design-level)
- Add `zod` dependency for schema validation (REQ-1)
- Add/confirm scripts to support tags/profiles and reporting (REQ-2/REQ-3)

**Deliverable:** A clear list of required dependencies/scripts (implementation may live in package config, but this design describes them).

---

## 3) REQ-1 — zod Validation for `POST /auth/login`

### T1.0 — Create schema module (zod)
- Add a schema definition representing the expected response shape for login.
- Include strictness guidance:
  - Prefer `z.object({...}).strict()` for early detection of contract changes
  - Or allow unknown keys with `.passthrough()` if the API is known to evolve frequently

**Example schema fields (illustrative):**
- `accessToken: string` (required)
- Optional: `expiresIn`, `tokenType`, `refreshToken` (if present in the API)

**Deliverable:** `AuthLoginResponseSchema` (zod), plus inferred TS type.

### T1.1 — Validate in API layer boundary
- In `AuthApi.login()`:
  - parse JSON response
  - validate against zod schema
  - map `accessToken -> token` only after validation passes
- On validation failure:
  - throw a descriptive error including:
    - endpoint name (`/auth/login`)
    - HTTP status (if available)
    - zod issue list (path + message)
    - raw payload snippet (redacted if sensitive)

**Deliverable:** Schema is enforced at boundary; errors are readable and actionable.

### T1.2 — Add deterministic tests for schema validation
- Positive test: valid credentials returns a token and passes schema
- Negative test: deterministic schema mismatch test (without requiring backend changes), options:
  1) Mock the API response (Playwright route interception) to return invalid payload
  2) Stub a helper in the API client layer (if architecture supports)
- Ensure negative test asserts:
  - error type/message
  - includes zod failure details

**Deliverable:** Tests prove validation works and failure messaging is stable.

---

## 4) REQ-2 — Tagging Conventions + Profiles/Projects

### Tag taxonomy (standard)
- `@smoke`: minimal critical-path checks
- `@regression`: broader coverage; stable, deterministic tests
- `@api`: API-only tests
- `@ui`: UI-only tests
- Optional (if needed later): `@e2e`, `@flaky` (use sparingly)

**Rules:**
- Every test should have at least one of `@api` or `@ui`.
- `@smoke` should be a strict subset of `@regression`.
- Avoid over-tagging; tags must be meaningful and stable.

### T2.0 — Implement/standardize tags in tests
- Ensure new and existing tests use consistent tags in titles, e.g.:
  - `test('@api @smoke login returns token', async () => { ... })`

**Deliverable:** Tags are uniformly applied.

### T2.1 — Configure profiles/projects for suite gating
Design options (choose one approach):
1) **Grep-based gating only** (simplest):
   - Smoke: `--grep @smoke`
   - Regression: `--grep @regression`
2) **Projects-based gating** (more structured):
   - Define `projects: [{ name: 'api', ... }, { name: 'ui', ... }]`
   - Optionally define `smoke`/`regression` via config or separate config files

**Deliverable:** Documented strategy + commands.

### T2.2 — Add scripts / documentation for common runs
- Document canonical commands in README/design:
  - `test:smoke`, `test:api`, `test:ui`, `test:regression`
- Optional: include “profiles” concept (e.g., env var or CLI flags) to adjust timeouts/artifacts.

**Deliverable:** One-liners to run suites consistently.

---

## 5) REQ-3 — Reporting & Artifacts

### T3.0 — Define reporting outputs
Recommended baseline:
- HTML report (local-friendly): `html`
- JUnit report (CI-friendly): `junit` (output to a stable path)
- Optional: `json` for tooling integrations

**Deliverable:** Reporting formats defined and documented.

### T3.1 — Artifact retention policy (trace/video/screenshot)
Recommended defaults:
- `trace: 'on-first-retry'` (captures diagnostics without huge storage)
- `screenshot: 'only-on-failure'`
- `video: 'retain-on-failure'`
- Ensure consistent output folders:
  - test results: `test-results/`
  - playwright report: `playwright-report/`
  - junit xml: e.g., `test-results/junit.xml`

**Deliverable:** Documented artifact rules and locations.

### T3.2 — Add guidance for debugging and triage
- Provide “how to debug” section:
  - running with `--headed`
  - `--debug`
  - opening trace via `npx playwright show-trace <path>`
- Provide a quick triage checklist:
  - check HTML report
  - open trace
  - inspect request/response logs (especially for schema validation failures)

**Deliverable:** Clear debugging workflow that reduces time-to-fix.

---

## 6) Testing Commands (documented contract)

### Core commands
- Smoke suite:
  - `npx playwright test --grep @smoke`
- Regression suite:
  - `npx playwright test --grep @regression`
- API only:
  - `npx playwright test --grep @api`
- UI only:
  - `npx playwright test --grep @ui`

### Debugging runs
- Headed:
  - `npx playwright test --headed`
- Interactive debug:
  - `npx playwright test --debug`
- Re-run failures:
  - `npx playwright test --last-failed`

### Reports
- Open last HTML report:
  - `npx playwright show-report`
- Show a trace:
  - `npx playwright show-trace test-results/**/trace.zip`

---

## 7) Rollback Plan
- Revert commits that touch:
  - API schema modules / zod usage
  - API client boundary (`AuthApi.login()` and related)
  - Playwright configuration for reporters/artifacts
  - Test titles/tags and any new suite scripts/docs
- No database migrations or external system changes expected.

---

## 8) Risks and Mitigations

### Risk R1 — Schema strictness causes noisy failures
- **Impact:** Tests fail when API adds new fields or slightly changes responses.
- **Mitigation:** Choose `.passthrough()` if API is additive; otherwise keep `.strict()` and update schema intentionally.

### Risk R2 — Negative validation test becomes non-deterministic
- **Impact:** Test flakiness if relying on real backend behavior.
- **Mitigation:** Use Playwright route interception to mock invalid responses deterministically.

### Risk R3 — Artifact storage growth
- **Impact:** Large traces/videos in CI or local disk.
- **Mitigation:** Use `on-first-retry` and retain-on-failure policies; periodically clean `test-results/`.

### Risk R4 — Tag drift and inconsistent usage
- **Impact:** Suite gating becomes unreliable.
- **Mitigation:** Enforce conventions in code review; add lint-like checks later (optional future work).

---

## 9) Traceability Matrix

| Requirement | Description | Tasks | Primary Deliverables |
|---|---|---|---|
| REQ-1 | zod validation at API boundary (login) | T1.0, T1.1, T1.2 | zod schema module; validated `AuthApi.login()`; positive/negative tests |
| REQ-2 | Tagging conventions + profiles/projects | T2.0, T2.1, T2.2 | Standard tags; documented suite commands; (optional) Playwright projects |
| REQ-3 | Reporting & artifacts | T3.0, T3.1, T3.2 | Reporter config guidance; artifact retention policy; debugging guide |

---

## 10) Acceptance Criteria (design-level)
- REQ-1: Login API response is validated via zod; failures provide clear diagnostics; deterministic negative test exists.
- REQ-2: Tags are standardized; smoke/regression runs are documented and repeatable.
- REQ-3: Reports and artifacts are consistently produced and easy to consume; debugging workflow is documented.
