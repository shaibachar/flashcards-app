import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Deck } from '../models/deck';
import { CommonModule } from '@angular/common';
import { DeckService } from '../services/deck.service';
import { MenuComponent } from '../menu/menu.component';
import { FormsModule } from '@angular/forms';
import { FlashcardQueryService } from '../services/flashcard-query.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MenuComponent, FormsModule],
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
    return this.decks.filter(deck =>
      (deck.name || deck.id).toLowerCase().includes(text) ||
      (deck.description || '').toLowerCase().includes(text)
    );
  }

  constructor(
    private router: Router,
    private deckService: DeckService,
    private flashcardQueryService: FlashcardQueryService
  ) { }


  ngOnInit(): void {
    this.deckService.getDecks().subscribe({
      next: (data) => this.decks = data,
      error: (err) => console.error('Failed to load decks:', err)
    });
  }

  selectDeck(deck: Deck) {
    console.log("select deck"+deck.id);
    this.router.navigate(['/deck', deck.id]);
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