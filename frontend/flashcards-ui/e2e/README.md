# E2E Tests with Playwright

This directory contains end-to-end tests for the Flashcards application using [Playwright](https://playwright.dev/).

## Test Structure

The tests are organized by feature:

- **auth.spec.ts** - Authentication and login/logout tests
- **flashcards.spec.ts** - Flashcard CRUD operations and management
- **study-mode.spec.ts** - Study mode interactions, swipe gestures, and card flipping
- **decks.spec.ts** - Deck management and operations
- **learning-paths.spec.ts** - Learning path creation and tracking
- **navigation.spec.ts** - Navigation and menu functionality
- **mobile.spec.ts** - Mobile-specific tests including touch gestures

## Running Tests

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

### Test Commands

Run all tests (headless):
```bash
npm run test:e2e
```

Run tests with UI mode (interactive):
```bash
npm run test:e2e:ui
```

Run tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

Debug tests:
```bash
npm run test:e2e:debug
```

Run tests in specific browser:
```bash
npm run test:e2e:chromium
```

Run mobile tests:
```bash
npm run test:e2e:mobile
```

View test report:
```bash
npm run test:e2e:report
```

### Running Specific Tests

Run a specific test file:
```bash
npx playwright test auth.spec.ts
```

Run tests matching a pattern:
```bash
npx playwright test --grep "login"
```

Run a specific test:
```bash
npx playwright test auth.spec.ts:10
```

## Test Configuration

Configuration is in `playwright.config.ts`:

- **baseURL**: `http://localhost:4200`
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile devices**: Pixel 5, iPhone 12
- **Auto-start dev server**: Tests automatically start the Angular dev server
- **Screenshots**: Captured on test failure
- **Traces**: Captured on first retry for debugging

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code (login, navigation, etc.)
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test code
    await page.click('button');
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Common Patterns

#### Login
```typescript
await page.fill('input[type="email"]', 'admin@example.com');
await page.fill('input[type="password"]', 'admin123');
await page.click('button[type="submit"]');
await page.waitForURL(/\/(home|decks|flashcards)/);
```

#### Wait for Elements
```typescript
await page.waitForSelector('.element', { timeout: 5000 });
await expect(page.locator('.element')).toBeVisible();
```

#### Swipe Gestures
```typescript
const box = await element.boundingBox();
if (box) {
  await page.mouse.move(box.x + 50, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width - 50, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
}
```

## CI/CD Integration

The tests are configured to run in CI environments:

- Retry failed tests 2 times
- Run tests sequentially (not in parallel)
- Don't reuse existing dev server

Set `CI=true` environment variable in your CI pipeline:
```bash
CI=true npm run test:e2e
```

## Troubleshooting

### Tests Timing Out

Increase timeout in `playwright.config.ts`:
```typescript
use: {
  timeout: 30000, // 30 seconds per test
}
```

### Dev Server Not Starting

Ensure backend API is running on expected port. Update proxy configuration in `proxy.conf.json` if needed.

### Flaky Tests

Add explicit waits:
```typescript
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);
```

### Debugging Failed Tests

1. View the HTML report: `npm run test:e2e:report`
2. Check screenshots in `test-results/` directory
3. View traces in the Playwright Trace Viewer
4. Run in debug mode: `npm run test:e2e:debug`

## Best Practices

1. **Use data-testid attributes** - Add `data-testid` to elements for stable selectors
2. **Avoid hardcoded waits** - Use `waitForSelector` instead of `waitForTimeout`
3. **Test user flows** - Test complete user journeys, not just individual actions
4. **Keep tests independent** - Each test should work in isolation
5. **Use page objects** - Extract common interactions into reusable functions
6. **Handle async properly** - Always await async operations
7. **Clean up state** - Reset data between tests when needed

## Coverage

Current test coverage includes:

- ✅ Authentication (login, logout, error handling)
- ✅ Flashcard management (CRUD operations)
- ✅ Study mode (card flipping, gestures)
- ✅ Deck management
- ✅ Learning paths
- ✅ Navigation and routing
- ✅ Mobile gestures (swipe, tap, double-tap)
- ✅ Responsive design
- ✅ Cross-browser compatibility

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Test Selector Best Practices](https://playwright.dev/docs/selectors)
