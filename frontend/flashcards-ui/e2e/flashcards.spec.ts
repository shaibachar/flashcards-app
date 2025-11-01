import { test, expect } from '@playwright/test';

test.describe('Flashcards Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(home|decks|flashcards)/, { timeout: 10000 });
  });

  test('should navigate to flashcards page', async ({ page }) => {
    // Navigate to manage flashcards
    await page.click('a[href*="manage-flashcards"], button:has-text("Manage")');
    await expect(page).toHaveURL(/manage-flashcards/);
  });

  test('should display flashcards list', async ({ page }) => {
    await page.goto('/manage-flashcards');
    
    // Wait for flashcards to load
    await page.waitForSelector('.flashcard, .card, table', { timeout: 5000 });
    
    // Check that flashcards are displayed
    const flashcards = page.locator('.flashcard, .card, tbody tr');
    await expect(flashcards.first()).toBeVisible();
  });

  test('should create a new flashcard', async ({ page }) => {
    await page.goto('/manage-flashcards');
    
    // Click create/add button
    await page.click('button:has-text("Add"), button:has-text("Create"), button:has-text("New")');
    
    // Fill in flashcard details
    await page.fill('input[name="question"], textarea[name="question"]', 'What is TypeScript?');
    await page.fill('input[name="answer"], textarea[name="answer"]', 'A typed superset of JavaScript');
    
    // Select or fill deck/category if needed
    const deckSelector = page.locator('select[name="deck"], select[name="deckId"]');
    if (await deckSelector.isVisible()) {
      await deckSelector.selectOption({ index: 1 });
    }
    
    // Save the flashcard
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify flashcard was created
    await expect(page.getByText('What is TypeScript?')).toBeVisible({ timeout: 5000 });
  });

  test('should edit an existing flashcard', async ({ page }) => {
    await page.goto('/manage-flashcards');
    
    // Click edit button on first flashcard
    const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
    await editButton.click();
    
    // Modify the question
    const questionInput = page.locator('input[name="question"], textarea[name="question"]');
    await questionInput.clear();
    await questionInput.fill('Updated Question');
    
    // Save changes
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify update
    await expect(page.getByText('Updated Question')).toBeVisible({ timeout: 5000 });
  });

  test('should delete a flashcard', async ({ page }) => {
    await page.goto('/manage-flashcards');
    
    // Get the text of the first flashcard to verify deletion
    const firstFlashcard = page.locator('.flashcard, .card, tbody tr').first();
    const flashcardText = await firstFlashcard.textContent();
    
    // Click delete button
    const deleteButton = page.locator('button:has-text("Delete"), button[aria-label*="delete"]').first();
    await deleteButton.click();
    
    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
    
    // Verify flashcard is no longer visible
    await expect(page.getByText(flashcardText || '')).not.toBeVisible({ timeout: 5000 });
  });

  test('should search/filter flashcards', async ({ page }) => {
    await page.goto('/manage-flashcards');
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('TypeScript');
      
      // Wait for filtered results
      await page.waitForTimeout(500);
      
      // Verify filtered results contain search term
      const results = page.locator('.flashcard, .card, tbody tr');
      const count = await results.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});
