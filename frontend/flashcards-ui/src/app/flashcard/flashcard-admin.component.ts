import { Component, OnInit } from '@angular/core';
import { Flashcard } from '../models/flashcard';
import { FlashcardService } from '../services/flashcard.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

function isUuidObject(id: unknown): id is { uuid: string } {
  return (
    typeof id === 'object' && id !== null && 'uuid' in id && typeof (id as any).uuid === 'string'
  );
}

function normalizeId(id: unknown): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof id === 'string') {
    if (uuidRegex.test(id)) return id;
    try {
      const parsed = JSON.parse(id);
      if (parsed && typeof parsed.uuid === 'string') return parsed.uuid;
    } catch {
      // Not a JSON string, fall through
    }
  }
  if (typeof id === 'object' && id !== null && 'uuid' in id && typeof (id as any).uuid === 'string') {
    return (id as any).uuid;
  }
  return '';
}

interface AdminFlashcard extends Flashcard {
  userScore?: number;
}

@Component({
  selector: 'app-flashcard-admin',
  standalone: true,
  templateUrl: './flashcard-admin.component.html',
  styleUrls: ['./flashcard-admin.component.css'],
  imports: [CommonModule, FormsModule]
})
export class FlashcardAdminComponent implements OnInit {
  flashcards: AdminFlashcard[] = [];
  editCard: AdminFlashcard | null = null;
  newCard: AdminFlashcard = { id: '', question: '', answer: '', score: 0,
    explanation: '', deckId: '', topic: '', questionImage: '', answerImage: '', explanationImage: '' };

  constructor(private flashcardService: FlashcardService, private router: Router) { }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    this.flashcardService.getAll().subscribe(cards => {
      // Normalize all flashcard IDs to be strings and set userScore from score
      this.flashcards = cards.map(card => {
        let id: string;
        if (typeof card.id === 'string') {
          id = card.id;
        } else if (isUuidObject(card.id)) {
          id = (card.id as { uuid: string }).uuid;
        } else {
          id = '';
        }
        // Use userScore for frontend progress, fallback to score if present
        const userScore = (card as any).userScore ?? card.score ?? 0;
        return { ...card, id, userScore } as AdminFlashcard;
      });
    });
  }

  startEdit(card: AdminFlashcard) {
    // Always normalize id and userScore when editing
    let id: string;
    if (typeof card.id === 'string') {
      id = card.id;
    } else if (isUuidObject(card.id)) {
      id = (card.id as { uuid: string }).uuid;
    } else {
      id = '';
    }
    const userScore = (card as any).userScore ?? card.score ?? 0;
    this.editCard = { ...card, id, userScore };
  }

  cancelEdit() {
    this.editCard = null;
  }

  saveEdit() {
    if (this.editCard) {
      // Always normalize id before sending to backend
      const normalizedId = normalizeId(this.editCard.id);
      // Remove userScore before sending to backend, as backend does not expect it
      const { userScore, ...rest } = this.editCard;
      const normalizedCard = { ...rest, id: normalizedId };
      this.flashcardService.updateFlashcard(normalizedCard as Flashcard).subscribe(() => {
        this.loadAll();
        this.cancelEdit();
      });
    }
  }

  deleteCard(id: string) {
    this.flashcardService.deleteFlashcard(normalizeId(id)).subscribe(() => this.loadAll());
  }

  addCard() {
    // Always normalize id before sending to backend
    const normalizedId = normalizeId(this.newCard.id);
    // Remove userScore before sending to backend, as backend does not expect it
    const { userScore, ...rest } = this.newCard;
    const normalizedCard = { ...rest, id: normalizedId };
    this.flashcardService.create(normalizedCard as Flashcard).subscribe(() => {
      this.loadAll();
      this.newCard = { id: '', question: '', answer: '', score: 0,
        explanation: '', deckId: '', topic: '', questionImage: '', answerImage: '', explanationImage: '' };
    });
  }
}
