# Implementation Plan — Approved Enhancements (Requirements v1)

## Scope
Improvements to the Playwright+TypeScript automation framework:
1) API boundary schema validation (starting with POST /auth/login)
2) Standard test tagging conventions (@smoke, @regression) + suite gating guidance
3) More robust authentication setup with better diagnostics

Out of scope: application changes, deployments, Jira work.

## Baseline
- Branch: main
- Commit: unknown (tooling limitation)
- Key files: `Sample framework/playwright.config.ts`, `Sample framework/src/api/*`, `Sample framework/tests/setup/*`, `Sample framework/tests/api/*`, `Sample framework/tests/ui/*`

## Plan (ordered)
### 1. API schema validation (REQ-FR1)
- Decide validation approach (zod/valibot vs manual guards)
- Add schema module for auth login response
- Validate response in `AuthApi.login()` prior to mapping `accessToken -> token`
- Add tests:
  - Positive: token returned for valid creds
  - Negative: schema mismatch triggers readable error (prefer deterministic test)

### 2. Tagging conventions + regression example (REQ-FR2)
- Update README with tag taxonomy and run commands
- Add (optional) npm script for regression
- Replace placeholder UI test with meaningful `@regression` test

### 3. Auth setup robustness (REQ-FR3)
- Add structured steps and stronger assertions in `auth.setup.ts`:
  - URL ends with `/secure`
  - welcome heading visible
- Ensure `storageState` file is only written after verification passes

## Testing
- Smoke: `npm run test:smoke`
- API: `npm run test:api`
- UI: `npm run test:ui`
- Regression (documented): `npx playwright test --grep @regression`
- Reports: `npm run report`

## Rollback
Revert commits touching schemas/AuthApi/setup/README/package scripts. No DB or external migrations.
