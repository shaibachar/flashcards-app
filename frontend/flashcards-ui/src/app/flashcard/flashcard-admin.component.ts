import { Component, OnInit } from '@angular/core';
import { Flashcard } from '../models/flashcard';
import { FlashcardService } from '../services/flashcard.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-flashcard-admin',
  standalone: true,
  templateUrl: './flashcard-admin.component.html',
  styleUrls: ['./flashcard-admin.component.css'],
  imports: [CommonModule, FormsModule]
})
export class FlashcardAdminComponent implements OnInit {
  flashcards: Flashcard[] = [];
  editCard: Flashcard | null = null;
  newCard: Flashcard = { id: '', question: '', answer: '', score: 0, explanation: '', deckId: '', topic: '' };

  constructor(private flashcardService: FlashcardService, private router: Router) { }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    // You may want to implement a getAll endpoint in your backend for this
    this.flashcardService.getAll().subscribe(cards => this.flashcards = cards);
  }

  startEdit(card: Flashcard) {
    this.editCard = { ...card };
  }

  cancelEdit() {
    this.editCard = null;
  }

  saveEdit() {
    if (this.editCard) {
      this.flashcardService.updateFlashcard(this.editCard).subscribe(() => {
        this.loadAll();
        this.cancelEdit();
      });
    }
  }

  deleteCard(id: string) {
    this.flashcardService.deleteFlashcard(id).subscribe(() => this.loadAll());
  }

  addCard() {
    this.flashcardService.create(this.newCard).subscribe(() => {
      this.loadAll();
      this.newCard = { id: '', question: '', answer: '', score: 0, explanation: '', deckId: '', topic: '' };
    });
  }
}
