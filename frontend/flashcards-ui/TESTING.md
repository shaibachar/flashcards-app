# Quick Start Guide - Running E2E Tests

This guide will help you quickly set up and run the Playwright E2E tests for the Flashcards application.

## Prerequisites

1. **Node.js** (v18 or later)
2. **Backend API** running on `http://localhost:5000`
3. **Test user credentials** (admin@example.com / admin123)

## Installation

```bash
# Navigate to the frontend directory
cd frontend/flashcards-ui

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## Running Tests

### Quick Run (Recommended for First Time)

```bash
# Run all tests in headless mode
npm run test:e2e
```

This will:
- Automatically start the Angular dev server on `http://localhost:4200`
- Run all tests in Chromium (headless)
- Generate an HTML report

### Interactive Mode (Great for Development)

```bash
# Run tests with interactive UI
npm run test:e2e:ui
```

This opens Playwright's UI mode where you can:
- See tests in a visual interface
- Run individual tests
- Watch tests execute in real-time
- Debug test failures

### Debug Mode

```bash
# Run tests with debugger
npm run test:e2e:debug
```

This will:
- Open tests in debug mode
- Pause on first test
- Allow step-by-step execution

### Specific Test Suites

```bash
# Run only authentication tests
npx playwright test auth.spec.ts

# Run only study mode tests
npx playwright test study-mode.spec.ts

# Run only mobile tests
npm run test:e2e:mobile
```

## Viewing Results

After tests run, view the HTML report:

```bash
npm run test:e2e:report
```

This opens a detailed report showing:
- Pass/fail status for each test
- Screenshots of failures
- Test execution traces
- Performance metrics

## Common Issues

### Port Already in Use

If port 4200 is already in use:
1. Stop any running `ng serve` processes
2. Or set `reuseExistingServer: true` in `playwright.config.ts`

### Backend Not Running

If tests fail with connection errors:
1. Start the backend API: `cd backend && pipenv run uvicorn app.main:app --port 5000`
2. Verify it's accessible: `curl http://localhost:5000/flashcards`

### Test Data Issues

If tests fail due to missing data:
1. Ensure backend is properly seeded with test data
2. Check that test user exists: `admin@example.com`
3. Verify decks and flashcards are available

### Browser Installation Failed

If Playwright browsers won't install:
```bash
# Try manual installation with dependencies
npx playwright install --with-deps chromium
```

## Test Structure

```
e2e/
├── auth.spec.ts           # Login/logout tests
├── flashcards.spec.ts     # CRUD operations
├── study-mode.spec.ts     # Study interactions & gestures
├── decks.spec.ts          # Deck management
├── learning-paths.spec.ts # Learning path features
├── navigation.spec.ts     # Navigation & routing
├── mobile.spec.ts         # Mobile-specific tests
├── fixtures.ts            # Custom test fixtures
├── page-objects.ts        # Page object models
└── README.md             # Detailed documentation
```

## Writing Your First Test

Create a new file `e2e/my-test.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('my first test', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Flashcards/);
});
```

Run it:
```bash
npx playwright test my-test.spec.ts
```

## Next Steps

1. Read the detailed [E2E README](./e2e/README.md)
2. Review existing tests for examples
3. Use page objects for maintainable tests
4. Set up CI/CD with the included GitHub Actions workflow

## Need Help?

- [Playwright Documentation](https://playwright.dev)
- [Playwright Discord](https://aka.ms/playwright/discord)
- Project Issues: Open an issue on GitHub
