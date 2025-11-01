import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Deck } from '../models/deck';
import { CommonModule } from '@angular/common';
import { DeckService } from '../services/deck.service';
import { FormsModule } from '@angular/forms';
import { FlashcardQueryService } from '../services/flashcard-query.service';
import { TranslatePipe } from '../services/translate.pipe';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-home',
  standalone: true,
imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [FlashcardQueryService]
})
export class HomeComponent {
  decks: Deck[] = [];
  filterText: string = '';
  queryText: string = '';
  editingDeck: Deck | null = null;
  originalDeckId: string = '';
  editingCount = 0;
  get filteredDecks(): Deck[] {
    const text = this.filterText.toLowerCase();
    return this.decks.filter(deck =>
      (deck.name || deck.id).toLowerCase().includes(text) ||
      (deck.description || '').toLowerCase().includes(text)
    );
  }

  constructor(
    private router: Router,
    private deckService: DeckService,
    private flashcardQueryService: FlashcardQueryService,
    private logger: LoggerService
  ) { }


  ngOnInit(): void {
    this.deckService.getDecks().subscribe({
      next: (data) => this.decks = data,
      error: (err) => this.logger.error('Failed to load decks:', err)
    });
  }

  selectDeck(deck: Deck) {
    this.logger.info('select deck' + deck.id);
    // Navigate directly to deck view
    this.router.navigate(['/deck', deck.id]);
  }

  refreshCoverage(deck: Deck, event: Event) {
    event.stopPropagation();
    this.deckService.refreshCoverage(deck.id).subscribe({
      next: (cov) => deck.coverage = cov,
      error: (err) => this.logger.error('Failed to refresh coverage:', err)
    });
  }

  openEditDeck(deck: Deck, event: Event) {
    event.stopPropagation();
    this.originalDeckId = deck.id;
    this.editingDeck = { ...deck };
    this.editingCount = this.getCardCount(deck);
  }

  closeEditDeck() {
    this.editingDeck = null;
    this.originalDeckId = '';
    this.editingCount = 0;
  }

  saveDeck() {
    if (!this.editingDeck) return;
    this.deckService.updateDeck(this.originalDeckId, this.editingDeck).subscribe({
      next: d => {
        const idx = this.decks.findIndex(dc => dc.id === this.originalDeckId);
        if (idx !== -1) this.decks[idx] = d;
        this.closeEditDeck();
      },
      error: err => alert('Failed to update deck: ' + (err?.message || err))
    });
  }

  getCardCount(deck: Deck): number {
    const m = /(\d+) cards?\)/.exec(deck.description || '');
    return m ? parseInt(m[1], 10) : 0;
  }

  submitQuery() {
    if (!this.queryText.trim()) return;
    this.flashcardQueryService.queryString(this.queryText).subscribe({
      next: (result) => {
        if (Array.isArray(result) && result.length > 0) {
          // Create a temp deck from the response
          const tempDeck = {
            id: 'temp-' + Date.now(),
            name: 'Query Results',
            description: `Results for: "${this.queryText}"`,
            flashcards: result.map((r: any) => r.card)
          };
          // Store the temp deck in sessionStorage
          sessionStorage.setItem(tempDeck.id, JSON.stringify(tempDeck));
          this.router.navigate(['/deck', tempDeck.id]);
        } else if (result && result.deckId) {
          this.router.navigate(['/deck', result.deckId]);
        } else if (result && result.tempDeckId) {
          this.router.navigate(['/deck', result.tempDeckId]);
        } else {
          alert('No deck returned from query.');
        }
      },
      error: (err) => {
        alert('Query failed: ' + (err?.message || err));
      }
    });
  }
}