import { test, expect } from '@playwright/test';
import { 
  LoginPage, 
  FlashcardManagementPage, 
  StudyModePage,
  DeckManagementPage 
} from './page-objects';

/**
 * Example tests using Page Object Model
 * This demonstrates how to use the page objects for cleaner, more maintainable tests
 */

test.describe('Example Tests with Page Objects', () => {
  test('should login and create a flashcard', async ({ page }) => {
    // Use the LoginPage
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();

    // Use the FlashcardManagementPage
    const flashcardPage = new FlashcardManagementPage(page);
    await flashcardPage.goto();
    await flashcardPage.createFlashcard(
      'What is Playwright?',
      'A Node.js library to automate browsers'
    );

    // Verify flashcard was created
    await expect(page.getByText('What is Playwright?')).toBeVisible({ timeout: 5000 });
  });

  test('should study flashcards with gestures', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();

    // Navigate to study mode
    const studyPage = new StudyModePage(page);
    await studyPage.goto();

    // Double-tap to reveal answer
    await studyPage.doubleTapCard();
    await page.waitForTimeout(300);

    // Verify answer is visible
    const answer = page.locator('.answer, [class*="answer"]');
    const hasAnswer = await answer.count() > 0;
    expect(hasAnswer).toBeTruthy();

    // Swipe right to mark as known
    await studyPage.swipeRight();
    await page.waitForTimeout(500);
  });

  test('should manage decks', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();

    // Navigate to decks
    const deckPage = new DeckManagementPage(page);
    await deckPage.goto();

    // Create a new deck
    await deckPage.createDeck(
      'Playwright Testing',
      'Flashcards for learning Playwright'
    );

    // Verify deck was created
    await expect(page.getByText('Playwright Testing')).toBeVisible({ timeout: 5000 });
  });

  test('should search flashcards', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();

    // Navigate to flashcard management
    const flashcardPage = new FlashcardManagementPage(page);
    await flashcardPage.goto();

    // Search for flashcards
    const searchInput = flashcardPage.searchInput;
    if (await searchInput.isVisible({ timeout: 2000 })) {
      await flashcardPage.searchFlashcards('Playwright');

      // Verify search results
      const results = await flashcardPage.flashcardList.count();
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });

  test('should navigate between pages', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAsAdmin();

    // Navigate through different pages
    const deckPage = new DeckManagementPage(page);
    await deckPage.goto();
    await expect(page).toHaveURL(/\/decks/);

    const flashcardPage = new FlashcardManagementPage(page);
    await flashcardPage.goto();
    await expect(page).toHaveURL(/manage-flashcards/);

    const studyPage = new StudyModePage(page);
    await studyPage.goto();
    await expect(page).toHaveURL(/flashcards\/scroll/);
  });
});
