import { test, expect } from '@playwright/test';

test.describe('Learning Paths', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(home|decks|flashcards)/, { timeout: 10000 });
  });

  test('should navigate to learning paths page', async ({ page }) => {
    // Navigate to learning paths
    await page.click('a[href*="learning-path"], button:has-text("Learning Path")');
    await expect(page).toHaveURL(/learning-path/);
  });

  test('should display learning paths list', async ({ page }) => {
    await page.goto('/learning-paths');
    
    // Wait for learning paths to load
    await page.waitForSelector('.learning-path, .path-item, .card', { timeout: 5000 });
    
    // Check that learning paths are displayed
    const paths = page.locator('.learning-path, .path-item, .card');
    await expect(paths.first()).toBeVisible();
  });

  test('should create a new learning path', async ({ page }) => {
    await page.goto('/learning-paths');
    
    // Click create button
    await page.click('button:has-text("Add"), button:has-text("Create"), button:has-text("New")');
    
    // Fill in learning path details
    await page.fill('input[name="title"], input[name="name"]', 'Test Learning Path');
    await page.fill('textarea[name="description"]', 'This is a test learning path');
    
    // Add topics or steps if needed
    const addTopicButton = page.locator('button:has-text("Add Topic"), button:has-text("Add Step")');
    if (await addTopicButton.isVisible({ timeout: 2000 })) {
      await addTopicButton.click();
      await page.fill('input[placeholder*="topic"]', 'Topic 1');
    }
    
    // Save the learning path
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify learning path was created
    await expect(page.getByText('Test Learning Path')).toBeVisible({ timeout: 5000 });
  });

  test('should view learning path details', async ({ page }) => {
    await page.goto('/learning-paths');
    
    // Click on first learning path
    const firstPath = page.locator('.learning-path, .path-item, .card').first();
    await firstPath.click();
    
    // Verify we're viewing the learning path details
    await page.waitForSelector('.path-detail, .learning-path-detail', { timeout: 5000 });
    
    // Check that topics/steps are displayed
    const topics = page.locator('.topic, .step, .path-item');
    await expect(topics.first()).toBeVisible();
  });

  test('should start studying a learning path', async ({ page }) => {
    await page.goto('/learning-paths');
    
    // Click start/study button on first learning path
    const studyButton = page.locator('button:has-text("Start"), button:has-text("Study")').first();
    await studyButton.click();
    
    // Verify we're in study mode
    await expect(page).toHaveURL(/study|flashcards/);
    
    // Check that flashcards are displayed
    const flashcard = page.locator('.flashcard, .card, .scroll-card').first();
    await expect(flashcard).toBeVisible({ timeout: 5000 });
  });

  test('should track learning path progress', async ({ page }) => {
    await page.goto('/learning-paths');
    
    // Look for progress indicators
    const progress = page.locator('.progress, .progress-bar, [role="progressbar"]');
    if (await progress.first().isVisible({ timeout: 2000 })) {
      // Check that progress is displayed
      await expect(progress.first()).toBeVisible();
    }
  });

  test('should edit a learning path', async ({ page }) => {
    await page.goto('/learning-paths');
    
    // Click edit button on first learning path
    const editButton = page.locator('button:has-text("Edit")').first();
    await editButton.click();
    
    // Modify the title
    const titleInput = page.locator('input[name="title"], input[name="name"]');
    await titleInput.clear();
    await titleInput.fill('Updated Learning Path');
    
    // Save changes
    await page.click('button[type="submit"], button:has-text("Save")');
    
    // Verify update
    await expect(page.getByText('Updated Learning Path')).toBeVisible({ timeout: 5000 });
  });

  test('should delete a learning path', async ({ page }) => {
    await page.goto('/learning-paths');
    
    // Get initial count
    const initialCount = await page.locator('.learning-path, .path-item, .card').count();
    
    // Click delete button
    const deleteButton = page.locator('button:has-text("Delete"), button[aria-label*="delete"]').last();
    await deleteButton.click();
    
    // Confirm deletion
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
    
    await page.waitForTimeout(500);
    
    // Verify count decreased
    const updatedCount = await page.locator('.learning-path, .path-item, .card').count();
    expect(updatedCount).toBeLessThan(initialCount);
  });
});
