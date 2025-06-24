import { Component, OnInit } from '@angular/core';
import { Flashcard } from '../../models/flashcard';
import { FlashcardService } from '../../services/flashcard.service';
import { FlashcardQueryService } from '../../services/flashcard-query.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-flashcard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './flashcard-admin.component.html',
  styleUrls: ['./flashcard-admin.component.css']
})
export class FlashcardAdminComponent implements OnInit {
  flashcards: Flashcard[] = [];
  filtered: Flashcard[] = [];
  filterText = '';
  filterDeck = '';
  sortColumn: keyof Flashcard | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  newFlashcard: Flashcard = { id: '', question: '', answer: '', explanation: '', deckId: '', score: 0, topic: '' };
  editingCard: Flashcard | null = null;

  constructor(
    private flashcardService: FlashcardService,
    private flashcardQueryService: FlashcardQueryService
  ) {}

  ngOnInit(): void {
    this.loadFlashcards();
  }

  loadFlashcards() {
    this.flashcardService.getAll().subscribe(cards => {
      this.flashcards = cards;
      this.applyFilter();
    });
  }

  applyFilter() {
    const text = this.filterText.toLowerCase();
    const deck = this.filterDeck.toLowerCase();
    this.filtered = this.flashcards.filter(c =>
      c.question.toLowerCase().includes(text) &&
      c.deckId.toLowerCase().includes(deck)
    );
    this.applySort();
  }

  sortTable(column: keyof Flashcard, direction: 'asc' | 'desc') {
    this.sortColumn = column;
    this.sortDirection = direction;
    this.applySort();
  }

  applySort() {
    if (!this.sortColumn) return;
    this.filtered = [...this.filtered].sort((a, b) => {
      const col = this.sortColumn as keyof Flashcard;
      const valA = (a[col] || '').toString().toLowerCase();
      const valB = (b[col] || '').toString().toLowerCase();
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  saveFlashcard() {
    const question = this.newFlashcard.question.trim();
    if (!question) return;

    const directDuplicate = this.flashcards.find(c =>
      c.question.trim().toLowerCase() === question.toLowerCase() &&
      c.id !== this.newFlashcard.id
    );
    if (directDuplicate) {
      alert('A flashcard with this question already exists.');
      return;
    }

    this.flashcardQueryService.queryString(question).subscribe({
      next: (results) => {
        if (Array.isArray(results)) {
          const close = results.find((r: any) => r.card && r.score > 0.97 && r.card.id !== this.newFlashcard.id);
          if (close) {
            alert('This flashcard appears to already exist.');
            return;
          }
        }
        this.performSave();
      },
      error: () => this.performSave()
    });
  }

  private performSave() {
    if (this.newFlashcard.id) {
      this.flashcardService.update(this.newFlashcard).subscribe(this.loadFlashcards.bind(this));
    } else {
      this.flashcardService.create(this.newFlashcard).subscribe(this.loadFlashcards.bind(this));
    }
    this.newFlashcard = { id: '', question: '', answer: '', explanation: '', deckId: '', score: 0, topic: '' };
  }

  edit(card: Flashcard) {
    this.newFlashcard = { ...card };
  }

  delete(card: Flashcard) {
    if (confirm('Delete this flashcard?')) {
      this.flashcardService.delete(card.id).subscribe(this.loadFlashcards.bind(this));
    }
  }
}
