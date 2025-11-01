import { test, expect } from '@playwright/test';

test.describe('Deck Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(home|decks|flashcards)/, { timeout: 10000 });
  });

  test('should display decks list', async ({ page }) => {
    await page.goto('/decks');
    
    // Wait for decks to load
    await page.waitForSelector('.deck, .card, .deck-item', { timeout: 5000 });
    
    // Check that at least one deck is displayed
    const decks = page.locator('.deck, .card, .deck-item');
    await expect(decks.first()).toBeVisible();
  });

  test('should create a new deck', async ({ page }) => {
    await page.goto('/decks');
    
    // Click create deck button
    await page.click('button:has-text("Add"), button:has-text("Create"), button:has-text("New Deck")');
    
    // Fill in deck details
    await page.fill('input[name="name"], input[placeholder*="name"]', 'Test Deck');
    await page.fill('textarea[name="description"], input[name="description"]', 'This is a test deck');
    
    // Save the deck
    await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
    
    // Verify deck was created
    await expect(page.getByText('Test Deck')).toBeVisible({ timeout: 5000 });
  });

  test('should open a deck and view its flashcards', async ({ page }) => {
    await page.goto('/decks');
    
    // Click on first deck
    const firstDeck = page.locator('.deck, .card, .deck-item').first();
    await firstDeck.click();
    
    // Verify we're viewing the deck's flashcards
    await expect(page).toHaveURL(/flashcards|study|deck/);
    
    // Check that flashcards are displayed
    const flashcards = page.locator('.flashcard, .card, .scroll-card');
    await expect(flashcards.first()).toBeVisible({ timeout: 5000 });
  });

  test('should edit a deck', async ({ page }) => {
    await page.goto('/decks');
    
    // Click edit button on first deck
    const editButton = page.locator('button:has-text("Edit")').first();
    await editButton.click();
    
    // Modify the deck name
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
    await nameInput.clear();
    await nameInput.fill('Updated Deck Name');
    
    // Save changes
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify update
    await expect(page.getByText('Updated Deck Name')).toBeVisible({ timeout: 5000 });
  });

  test('should delete a deck', async ({ page }) => {
    await page.goto('/decks');
    
    // Get initial deck count
    const initialCount = await page.locator('.deck, .card, .deck-item').count();
    
    // Click delete button on last deck
    const deleteButton = page.locator('button:has-text("Delete"), button[aria-label*="delete"]').last();
    await deleteButton.click();
    
    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
    
    await page.waitForTimeout(500);
    
    // Verify deck count decreased
    const updatedCount = await page.locator('.deck, .card, .deck-item').count();
    expect(updatedCount).toBeLessThan(initialCount);
  });

  test('should show deck statistics', async ({ page }) => {
    await page.goto('/decks');
    
    // Check for statistics display (card count, progress, etc.)
    const stats = page.locator('.stats, .statistics, .deck-info, .card-count');
    if (await stats.first().isVisible({ timeout: 2000 })) {
      await expect(stats.first()).toContainText(/\d+/); // Should contain numbers
    }
  });
});
