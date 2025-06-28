import { IonicModule } from '@ionic/angular';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Deck } from '../models/deck';
import { CommonModule } from '@angular/common';
import { DeckService } from '../services/deck.service';
import { FormsModule } from '@angular/forms';
import { FlashcardQueryService } from '../services/flashcard-query.service';
import { TranslatePipe } from '../services/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
imports: [IonicModule, CommonModule, FormsModule, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [FlashcardQueryService]
})
export class HomeComponent {
  decks: Deck[] = [];
  filterText: string = '';
  queryText: string = '';
  get filteredDecks(): Deck[] {
    const text = this.filterText.toLowerCase();
    const result = this.decks.filter(deck =>
      (deck.name || deck.id).toLowerCase().includes(text) ||
      (deck.description || '').toLowerCase().includes(text)
    );
    console.log('[HomeComponent] filtering decks with text:', text, 'count:', result.length);
    return result;
  }

  onFilterChange(value: string) {
    console.log('[HomeComponent] filterText changed:', value);
  }

  constructor(
    private router: Router,
    private deckService: DeckService,
    private flashcardQueryService: FlashcardQueryService
  ) {
    console.log('[HomeComponent] constructor');
  }


  ngOnInit(): void {
    console.log('[HomeComponent] ngOnInit');
    console.log('[HomeComponent] Fetching decks from service');
    this.deckService.getDecks().subscribe({
      next: (data) => {
        this.decks = data;
        console.log('[HomeComponent] Loaded decks:', data);
        console.log('[HomeComponent] total decks loaded:', this.decks.length);
      },
      error: (err) => console.error('[HomeComponent] Failed to load decks:', err)
    });
  }

  selectDeck(deck: Deck) {
    console.log('[HomeComponent] selectDeck ->', deck.id);
    this.router.navigate(['/deck', deck.id]);
  }

  submitQuery() {
    if (!this.queryText.trim()) return;
    console.log('[HomeComponent] submitQuery ->', this.queryText);
    this.flashcardQueryService.queryString(this.queryText).subscribe({
      next: (result) => {
        console.log('[HomeComponent] query result:', result);
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
