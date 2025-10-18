import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Login Page
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error, .alert-danger, [role="alert"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAsAdmin() {
    await this.login('admin@example.com', 'admin123');
    await this.page.waitForURL(/\/(home|decks|flashcards)/, { timeout: 10000 });
  }
}

/**
 * Page Object Model for Flashcard Management Page
 */
export class FlashcardManagementPage {
  readonly page: Page;
  readonly addButton: Locator;
  readonly questionInput: Locator;
  readonly answerInput: Locator;
  readonly saveButton: Locator;
  readonly flashcardList: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")');
    this.questionInput = page.locator('input[name="question"], textarea[name="question"]');
    this.answerInput = page.locator('input[name="answer"], textarea[name="answer"]');
    this.saveButton = page.locator('button[type="submit"], button:has-text("Save")');
    this.flashcardList = page.locator('.flashcard, .card, tbody tr');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
  }

  async goto() {
    await this.page.goto('/manage-flashcards');
  }

  async createFlashcard(question: string, answer: string) {
    await this.addButton.click();
    await this.questionInput.fill(question);
    await this.answerInput.fill(answer);
    await this.saveButton.click();
  }

  async searchFlashcards(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500); // Wait for search results
  }

  async getFirstFlashcard() {
    return this.flashcardList.first();
  }

  async editFirstFlashcard(newQuestion: string) {
    const editButton = this.page.locator('button:has-text("Edit")').first();
    await editButton.click();
    await this.questionInput.clear();
    await this.questionInput.fill(newQuestion);
    await this.saveButton.click();
  }

  async deleteFirstFlashcard() {
    const deleteButton = this.page.locator('button:has-text("Delete")').first();
    await deleteButton.click();
    
    // Handle confirmation if present
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")');
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
  }
}

/**
 * Page Object Model for Study Mode Page
 */
export class StudyModePage {
  readonly page: Page;
  readonly flashcard: Locator;
  readonly flipButton: Locator;
  readonly editButton: Locator;
  readonly voiceButton: Locator;
  readonly infoButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.flashcard = page.locator('.scroll-card, .flashcard, .card').first();
    this.flipButton = page.locator('button:has-text("Flip")');
    this.editButton = page.locator('button:has-text("Edit")');
    this.voiceButton = page.locator('button:has-text("Voice"), button:has-text("Speak")');
    this.infoButton = page.locator('button:has-text("Info")');
  }

  async goto(deckId: string = '1') {
    await this.page.goto(`/flashcards/scroll/${deckId}`);
  }

  async swipeRight() {
    const box = await this.flashcard.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + 50, box.y + box.height / 2);
      await this.page.mouse.down();
      await this.page.mouse.move(box.x + box.width - 50, box.y + box.height / 2, { steps: 10 });
      await this.page.mouse.up();
    }
  }

  async swipeLeft() {
    const box = await this.flashcard.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width - 50, box.y + box.height / 2);
      await this.page.mouse.down();
      await this.page.mouse.move(box.x + 50, box.y + box.height / 2, { steps: 10 });
      await this.page.mouse.up();
    }
  }

  async flipCard() {
    if (await this.flipButton.isVisible({ timeout: 2000 })) {
      await this.flipButton.click();
    }
  }

  async navigateToEdit() {
    await this.editButton.click();
  }
}

/**
 * Page Object Model for Deck Management Page
 */
export class DeckManagementPage {
  readonly page: Page;
  readonly addButton: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly saveButton: Locator;
  readonly deckList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New Deck")');
    this.nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
    this.descriptionInput = page.locator('textarea[name="description"], input[name="description"]');
    this.saveButton = page.locator('button[type="submit"], button:has-text("Save")');
    this.deckList = page.locator('.deck, .card, .deck-item');
  }

  async goto() {
    await this.page.goto('/decks');
  }

  async createDeck(name: string, description: string) {
    await this.addButton.click();
    await this.nameInput.fill(name);
    await this.descriptionInput.fill(description);
    await this.saveButton.click();
  }

  async openFirstDeck() {
    await this.deckList.first().click();
  }

  async editFirstDeck(newName: string) {
    const editButton = this.page.locator('button:has-text("Edit")').first();
    await editButton.click();
    await this.nameInput.clear();
    await this.nameInput.fill(newName);
    await this.saveButton.click();
  }

  async deleteLastDeck() {
    const deleteButton = this.page.locator('button:has-text("Delete")').last();
    await deleteButton.click();
    
    const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")');
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }
  }
}
