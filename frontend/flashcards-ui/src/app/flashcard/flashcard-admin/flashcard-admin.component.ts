import { Component, OnInit } from '@angular/core';
import { Flashcard } from '../../models/flashcard';
import { FlashcardService } from '../../services/flashcard.service';
import { FlashcardQueryService } from '../../services/flashcard-query.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../services/translate.pipe';
import { ImageService } from '../../services/image.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-flashcard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './flashcard-admin.component.html',
  styleUrls: ['./flashcard-admin.component.css']
})
export class FlashcardAdminComponent implements OnInit {
  flashcards: Flashcard[] = [];
  filtered: Flashcard[] = [];
  filterText = '';
  /**
   * Filter string for deck searches.
   * Retained for backwards compatibility with older templates that
   * bind to `filterDeck` directly.
   */
  filterDeck = '';
  filterByQuestion = true;
  filterByDeck = false;
  filterByTopic = false;
  filterByEmbedding = false;
  sortColumn: keyof Flashcard | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  newFlashcard: Flashcard = { id: '', question: '', questions: [], answer: '', explanation: '',
    deckId: '', score: 0, topic: '', questionImage: '', answerImage: '', explanationImage: '' };
  newQuestion = '';
  editingCard: Flashcard | null = null;
  availableImages: string[] = [];
  apiUrl = environment.apiBaseUrl;
  flashcardsLoaded = false;

  constructor(
    private flashcardService: FlashcardService,
    private flashcardQueryService: FlashcardQueryService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.imageService.list().subscribe(list => this.availableImages = list);
  }

  loadFlashcards() {
    this.flashcardService.getAll().subscribe(cards => {
      this.flashcards = cards;
      this.flashcardsLoaded = true;
      this.applyFilterInternal();
    });
  }

  applyFilter() {
    const hasFilter =
      this.filterText.trim() || this.filterDeck.trim() || this.filterByEmbedding;
    if (!hasFilter) {
      this.filtered = [];
      return;
    }
    if (!this.flashcardsLoaded) {
      this.loadFlashcards();
    } else {
      this.applyFilterInternal();
    }
  }

  private applyFilterInternal() {
    const text = this.filterText.toLowerCase();
    const deckText = this.filterDeck.toLowerCase();

    if (this.filterByEmbedding && this.filterText.trim()) {
      this.flashcardQueryService.queryString(this.filterText).subscribe(res => {
        const cards = Array.isArray(res) ? res.map((r: any) => r.card as Flashcard) : [];
        this.filtered = cards.filter(c => this.matchesOtherFilters(c, text));
        this.applySort();
      });
      return;
    }

    this.filtered = this.flashcards.filter(c =>
      this.matchesText(c, text) &&
      (!deckText || c.deckId.toLowerCase().includes(deckText))
    );
    this.applySort();
  }

  private matchesOtherFilters(card: Flashcard, text: string): boolean {
    const matches = [] as boolean[];
    if (this.filterByDeck) matches.push(card.deckId.toLowerCase().includes(text));
    if (this.filterByTopic) matches.push((card.topic || '').toLowerCase().includes(text));
    // When searching by embedding we want to include results that are semantically
    // similar even if they don't contain the exact text. Therefore ignore the
    // question text match in that mode.
    if (this.filterByQuestion && !this.filterByEmbedding) {
      matches.push(card.question.toLowerCase().includes(text));
    }
    return matches.length === 0 || matches.some(m => m);
  }

  private matchesText(card: Flashcard, text: string): boolean {
    const matches = [] as boolean[];
    if (this.filterByQuestion) matches.push(card.question.toLowerCase().includes(text));
    if (this.filterByDeck) matches.push(card.deckId.toLowerCase().includes(text));
    if (this.filterByTopic) matches.push((card.topic || '').toLowerCase().includes(text));
    if (matches.length === 0) return card.question.toLowerCase().includes(text);
    return matches.some(m => m);
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

    const directDuplicate = this.flashcards.find(c => {
      const qs = (c.questions && c.questions.length) ? c.questions : [c.question];
      return qs.some(q => q.trim().toLowerCase() === question.toLowerCase()) && c.id !== this.newFlashcard.id;
    });
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
    if (!this.newFlashcard.questions || this.newFlashcard.questions.length === 0) {
      if (this.newFlashcard.question.trim()) {
        this.newFlashcard.questions = [this.newFlashcard.question.trim()];
      }
    } else if (this.newFlashcard.questions.length > 0) {
      this.newFlashcard.question = this.newFlashcard.questions[0];
    }
    if (this.newFlashcard.id) {
      this.flashcardService.update(this.newFlashcard).subscribe(this.loadFlashcards.bind(this));
    } else {
      this.flashcardService.create(this.newFlashcard).subscribe(this.loadFlashcards.bind(this));
    }
    this.newFlashcard = {
      id: '', question: '', questions: [], answer: '', explanation: '', deckId: '', score: 0,
      topic: '', questionImage: '', answerImage: '', explanationImage: '' };
    this.newQuestion = '';
  }

  addQuestion() {
    const q = this.newQuestion.trim();
    if (!q) { return; }
    if (!this.newFlashcard.questions) { this.newFlashcard.questions = []; }
    this.newFlashcard.questions.push(q);
    if (!this.newFlashcard.question) {
      this.newFlashcard.question = q;
    }
    this.newQuestion = '';
  }

  generate() {
    const question = this.newFlashcard.question.trim();
    if (!question) {
      return;
    }
    this.flashcardService.generate(question).subscribe(res => {
      if (res.question) {
        if (!this.newFlashcard.questions) this.newFlashcard.questions = [];
        this.newFlashcard.questions.push(res.question);
        if (!this.newFlashcard.question) {
          this.newFlashcard.question = res.question;
        }
      }
      if (res.answer) {
        this.newFlashcard.answer = this.newFlashcard.answer
          ? this.newFlashcard.answer + '\n' + res.answer
          : res.answer;
      }
      if (res.explanation) {
        this.newFlashcard.explanation = this.newFlashcard.explanation
          ? this.newFlashcard.explanation + '\n' + res.explanation
          : res.explanation;
      }
    });
  }

  edit(card: Flashcard) {
    this.newFlashcard = { ...card };
  }

  delete(card: Flashcard) {
    this.flashcardService.delete(card.id).subscribe(this.loadFlashcards.bind(this));
  }

  validateAll() {
    this.flashcardService.cleanup().subscribe(res => {
      alert(`Fixed ${res.fixed} flashcards`);
      this.loadFlashcards();
    });
  }
}
