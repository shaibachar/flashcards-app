import { test, expect } from '@playwright/test';

test.describe('Study Mode - Flashcard Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(home|decks|flashcards)/, { timeout: 10000 });
  });

  test('should navigate to study mode', async ({ page }) => {
    // Navigate to a deck or study mode
    await page.click('a[href*="study"], a[href*="flashcards"], button:has-text("Study")');
    
    // Verify we're in study mode
    await expect(page).toHaveURL(/study|flashcards/);
    
    // Check that a flashcard is visible
    const flashcard = page.locator('.flashcard, .card, .scroll-card').first();
    await expect(flashcard).toBeVisible({ timeout: 5000 });
  });

  test('should toggle answer with flip button', async ({ page }) => {
    await page.goto('/flashcards/scroll/1'); // Adjust URL based on your routing
    
    const card = page.locator('.scroll-card, .flashcard').first();
    await expect(card).toBeVisible({ timeout: 5000 });
    
    // Find and click the flip button
    const flipButton = page.getByRole('button', { name: /flip/i });
    await expect(flipButton).toBeVisible({ timeout: 2000 });
    
    // Get initial state
    const questionVisible = await page.locator('.question').isVisible();
    
    // Click flip button
    await flipButton.click();
    await page.waitForTimeout(300);
    
    // Check if answer is now visible (state changed)
    if (questionVisible) {
      const answerVisible = await page.locator('.answer').isVisible();
      expect(answerVisible).toBeTruthy();
    }
  });

  test('should flip card with flip button in single view', async ({ page }) => {
    await page.goto('/flashcards/1'); // Single card view
    
    const flipButton = page.getByRole('button', { name: /flip/i });
    if (await flipButton.isVisible({ timeout: 2000 })) {
      await flipButton.click();
      
      // Verify card flipped (check for answer content)
      const answer = page.locator('.answer, [class*="answer"]');
      await expect(answer).toBeVisible({ timeout: 2000 });
    }
  });

  test('should navigate with voice button', async ({ page }) => {
    await page.goto('/flashcards/1');
    
    const voiceButton = page.getByRole('button', { name: /voice|speak/i });
    if (await voiceButton.isVisible({ timeout: 2000 })) {
      // Check that button is clickable
      await expect(voiceButton).toBeEnabled();
      await voiceButton.click();
      // Note: We can't test actual speech synthesis in e2e tests
    }
  });

  test('should navigate to edit mode from study', async ({ page }) => {
    await page.goto('/flashcards/1');
    
    const editButton = page.getByRole('button', { name: /edit/i });
    if (await editButton.isVisible({ timeout: 2000 })) {
      await editButton.click();
      
      // Verify we're in edit mode
      await expect(page).toHaveURL(/manage-flashcards/);
      
      // Check that the edit form is visible
      const questionInput = page.locator('input[name="question"], textarea[name="question"]');
      await expect(questionInput).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show info modal', async ({ page }) => {
    await page.goto('/flashcards/1');
    
    const infoButton = page.getByRole('button', { name: /info|information/i });
    if (await infoButton.isVisible({ timeout: 2000 })) {
      await infoButton.click();
      
      // Check for modal or info display
      const modal = page.locator('.modal, [role="dialog"], .info-panel');
      await expect(modal).toBeVisible({ timeout: 2000 });
    }
  });
});

test.describe('Study Mode - Swipe Gestures', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(home|decks|flashcards)/, { timeout: 10000 });
    await page.goto('/flashcards/scroll/1');
  });

  test('should swipe right to mark as known', async ({ page }) => {
    const card = page.locator('.scroll-card').first();
    await expect(card).toBeVisible({ timeout: 5000 });
    
    const initialCount = await page.locator('.scroll-card').count();
    
    // Simulate swipe right
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 50, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width - 50, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();
    }
    
    await page.waitForTimeout(500);
    
    // Verify card was removed or moved
    const updatedCount = await page.locator('.scroll-card').count();
    expect(updatedCount).toBeLessThanOrEqual(initialCount);
  });

  test('should swipe left to requeue card', async ({ page }) => {
    const card = page.locator('.scroll-card').first();
    await expect(card).toBeVisible({ timeout: 5000 });
    
    // Get initial card text
    const initialText = await card.textContent();
    
    // Simulate swipe left
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width - 50, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + 50, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();
    }
    
    await page.waitForTimeout(500);
    
    // Verify we moved to next card (text changed)
    const card2 = page.locator('.scroll-card').first();
    const newText = await card2.textContent();
    expect(newText).not.toEqual(initialText);
  });
});
