# Playwright + TypeScript Skeleton

Enterprise-oriented skeleton for UI and API test automation.

## Quick start

```bash
npm install
npx playwright install --with-deps
cp .env.example .env      # fill in TEST_USER / TEST_PASSWORD
npm test                  # all projects
npm run test:api          # API project only
npm run test:ui           # Chromium UI only
npm run test:smoke        # tests tagged @smoke
```

## Layout

```
src/
  config/    Typed env config (fail-fast, precedence rules)
  fixtures/  Playwright fixtures — the DI surface of the framework
  pages/     Page & component objects (application concepts, not DOM wrappers)
  api/       ApiClient (transport) + domain services (AuthApi, ...)
  models/    Typed domain models
  data/      Factories producing collision-safe test data
tests/
  setup/     Auth setup that produces reusable storageState
  ui/        UI specs, one authenticated identity per worker
  api/       API specs, no browser launched
```

## Where to add things

| Change                          | Edit                          |
|---------------------------------|-------------------------------|
| New page                        | `src/pages/*.page.ts` + fixture |
| New API endpoint                | `src/api/<domain>.api.ts`     |
| New environment                 | `src/config/env.ts`           |
| New browser / device            | `playwright.config.ts` project |
| New shared test data shape      | `src/models/` + `src/data/`   |

## Design decisions — see the explanation section of the delivery message.
