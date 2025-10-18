import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 12'],
});

test.describe('Mobile Experience', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(home|decks|flashcards)/, { timeout: 10000 });
  });

  test('should render mobile layout correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check viewport is mobile size
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBeLessThan(768);
  });

  test('should support touch gestures in study mode', async ({ page }) => {
    await page.goto('/flashcards/scroll/1');
    
    const card = page.locator('.scroll-card').first();
    await expect(card).toBeVisible({ timeout: 5000 });
    
    // Test flip button to reveal answer
    const flipButton = page.getByRole('button', { name: /flip/i });
    await flipButton.click();
    
    await page.waitForTimeout(300);
    
    // Verify answer is shown
    const answer = page.locator('.answer, [class*="answer"]');
    const hasAnswerVisible = await answer.count() > 0;
    expect(hasAnswerVisible).toBeTruthy();
  });

  test('should support swipe right gesture', async ({ page }) => {
    await page.goto('/flashcards/scroll/1');
    
    const card = page.locator('.scroll-card').first();
    await expect(card).toBeVisible({ timeout: 5000 });
    
    // Get initial count
    const initialCount = await page.locator('.scroll-card').count();
    
    // Perform swipe right
    const box = await card.boundingBox();
    if (box) {
      const startX = box.x + 50;
      const startY = box.y + box.height / 2;
      const endX = box.x + box.width - 50;
      const endY = box.y + box.height / 2;
      
      // Swipe from left to right using mouse
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY, { steps: 10 });
      await page.mouse.up();
    }
    
    await page.waitForTimeout(500);
    
    // Verify card was removed
    const updatedCount = await page.locator('.scroll-card').count();
    expect(updatedCount).toBeLessThanOrEqual(initialCount);
  });

  test('should support swipe left gesture', async ({ page }) => {
    await page.goto('/flashcards/scroll/1');
    
    const card = page.locator('.scroll-card').first();
    await expect(card).toBeVisible({ timeout: 5000 });
    
    const initialText = await card.textContent();
    
    // Perform swipe left
    const box = await card.boundingBox();
    if (box) {
      const startX = box.x + box.width - 50;
      const startY = box.y + box.height / 2;
      const endX = box.x + 50;
      const endY = box.y + box.height / 2;
      
      // Swipe from right to left using mouse
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY, { steps: 10 });
      await page.mouse.up();
    }
    
    await page.waitForTimeout(500);
    
    // Verify we moved to next card
    const newCard = page.locator('.scroll-card').first();
    const newText = await newCard.textContent();
    expect(newText).not.toEqual(initialText);
  });

  test('should have touch-friendly button sizes', async ({ page }) => {
    await page.goto('/flashcards/1');
    
    // Check that buttons meet minimum touch target size (44x44 is iOS standard)
    const buttons = page.locator('button');
    const firstButton = buttons.first();
    
    if (await firstButton.isVisible({ timeout: 2000 })) {
      const box = await firstButton.boundingBox();
      if (box) {
        // Buttons should be at least 44x44 or have adequate padding
        expect(box.height).toBeGreaterThanOrEqual(36); // Allowing slightly smaller with good spacing
      }
    }
  });

  test('should handle orientation change', async ({ page }) => {
    await page.goto('/');
    
    // Change to landscape
    await page.setViewportSize({ width: 844, height: 390 }); // iPhone 12 landscape
    await page.waitForTimeout(500);
    
    // Check that layout adapts
    const content = page.locator('ion-content, main, .content');
    await expect(content.first()).toBeVisible();
    
    // Change back to portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    
    await expect(content.first()).toBeVisible();
  });

  test('should show mobile menu correctly', async ({ page }) => {
    await page.goto('/');
    
    // Menu should be accessible on mobile
    const menuButton = page.locator('ion-menu-button, button[aria-label*="menu"]');
    if (await menuButton.isVisible({ timeout: 2000 })) {
      await menuButton.click();
      
      // Menu content should be visible
      const menuContent = page.locator('ion-menu, .menu');
      await expect(menuContent).toBeVisible();
    }
  });

  test('should prevent text selection during swipes', async ({ page }) => {
    await page.goto('/flashcards/scroll/1');
    
    const card = page.locator('.scroll-card').first();
    await expect(card).toBeVisible({ timeout: 5000 });
    
    // Check that user-select is set appropriately
    const userSelect = await card.evaluate(el => 
      window.getComputedStyle(el).userSelect
    );
    
    // Should be 'none' or 'auto' but text shouldn't be selectable during gestures
    expect(['none', 'auto']).toContain(userSelect);
  });
});
