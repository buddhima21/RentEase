# RentEase Frontend

RentEase is a rental house management system.
Frontend stack: React + Vite.

## Test Structure

- Integration tests: `src/**/*.test.{js,jsx,ts,tsx}`
- System tests (Playwright): `tests/system/**/*.spec.js`

## Commands

- `npm run dev`: Start frontend locally
- `npm run test`: Run all frontend tests
- `npm run test:integration`: Run integration tests only (Vitest)
- `npm run test:system`: Run system tests only (Playwright)
- `npm run test:e2e`: Alias for system tests (Playwright)

## Testing Recommendation

- Run integration tests on every code change.
- Run system tests before merge and release.
