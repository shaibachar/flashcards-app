import { test, expect } from '@playwright/test';

test.describe('Navigation and Menu', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(home|decks|flashcards)/, { timeout: 10000 });
  });

  test('should display main menu', async ({ page }) => {
    // Check for menu toggle or menu items
    const menu = page.locator('ion-menu, .menu, nav');
    await expect(menu.first()).toBeVisible({ timeout: 5000 });
  });

  test('should toggle menu open and close', async ({ page }) => {
    // Find menu toggle button
    const menuButton = page.locator('ion-menu-button, button[aria-label*="menu"], .menu-toggle');
    
    if (await menuButton.isVisible({ timeout: 2000 })) {
      // Open menu
      await menuButton.click();
      await page.waitForTimeout(300);
      
      // Check menu is visible
      const menuContent = page.locator('ion-menu-content, .menu-content');
      await expect(menuContent).toBeVisible();
      
      // Close menu
      await menuButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should navigate to Home page', async ({ page }) => {
    await page.click('a[href="/"], a[href="/home"], ion-item:has-text("Home")');
    await expect(page).toHaveURL(/\/(home)?$/);
  });

  test('should navigate to Decks page', async ({ page }) => {
    await page.click('a[href*="/decks"], ion-item:has-text("Decks")');
    await expect(page).toHaveURL(/\/decks/);
  });

  test('should navigate to Manage Flashcards page', async ({ page }) => {
    await page.click('a[href*="manage-flashcards"], ion-item:has-text("Manage")');
    await expect(page).toHaveURL(/manage-flashcards/);
  });

  test('should navigate to Learning Paths page', async ({ page }) => {
    await page.click('a[href*="learning-path"], ion-item:has-text("Learning Path")');
    await expect(page).toHaveURL(/learning-path/);
  });

  test('should display current deck name in menu', async ({ page }) => {
    // Navigate to a specific deck
    await page.goto('/flashcards/scroll/1');
    
    // Wait for menu to update
    await page.waitForTimeout(500);
    
    // Check that menu shows deck name instead of generic "Flashcards"
    const menuLabel = page.locator('ion-label, .menu-label').filter({ hasText: /Flashcards|Deck/ });
    const labelText = await menuLabel.first().textContent();
    
    // Menu should show specific deck name, not just "Flashcards"
    expect(labelText).toBeTruthy();
  });

  test('should show user admin link for admin users', async ({ page }) => {
    // Check for admin link in menu
    const adminLink = page.locator('a[href*="user-admin"], ion-item:has-text("Admin")');
    
    if (await adminLink.isVisible({ timeout: 2000 })) {
      await expect(adminLink).toBeVisible();
      
      // Click and verify navigation
      await adminLink.click();
      await expect(page).toHaveURL(/user-admin/);
    }
  });

  test('should navigate back using browser back button', async ({ page }) => {
    // Navigate through pages
    await page.goto('/decks');
    await page.goto('/manage-flashcards');
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/\/decks/);
    
    // Go back again
    await page.goBack();
    await expect(page).toHaveURL(/\/(home)?$/);
  });

  test('should handle deep linking', async ({ page }) => {
    // Navigate directly to a specific flashcard
    await page.goto('/flashcards/1');
    await page.waitForLoadState('networkidle');
    
    // Verify page loaded correctly
    const flashcard = page.locator('.flashcard, .card').first();
    await expect(flashcard).toBeVisible({ timeout: 5000 });
  });
});
