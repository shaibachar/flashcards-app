import { Component, OnInit } from '@angular/core';
import { Flashcard } from '../models/flashcard';
import { FlashcardService } from '../services/flashcard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';

function isUuidObject(id: unknown): id is { uuid: string } {
  return (
    typeof id === 'object' && id !== null && 'uuid' in id && typeof (id as any).uuid === 'string'
  );
}

function normalizeId(id: unknown): string {
  if (typeof id === 'string') return id;
  if (isUuidObject(id)) return id.uuid;
  return '';
}

@Component({
  standalone: true,
  selector: 'app-flashcard',
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.css'],
  imports: [CommonModule, FormsModule, MenuComponent]
})
export class FlashcardComponent implements OnInit {
  flashcards: Flashcard[] = [];
  currentIndex = 0;
  showAnswer = false;
  showExplanation = false;
  selectedFlashcard: Flashcard | null = null;

  constructor(
    private router: Router,
    private flashcardService: FlashcardService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const deckId = this.route.snapshot.paramMap.get('deckId');
    if (!deckId) {
      // Redirect or show error
      console.warn('Missing deckId!');
      return;
    }

    this.flashcardService.getRandom(deckId, 50).subscribe((cards: any[]) => {
      // Normalize all flashcard IDs to be strings
      this.flashcards = cards.map(card => {
        let id: string;
        if (typeof card.id === 'string') {
          id = card.id;
        } else if (isUuidObject(card.id)) {
          id = card.id.uuid;
        } else {
          id = '';
        }
        return { ...card, id } as Flashcard;
      });
    });
  }

  flip() {
    this.showAnswer = !this.showAnswer;
    this.showExplanation = false;

  }

  // Use a separate field for user progress, to avoid conflict with vector score
  userScore(card: Flashcard): number {
    // If the backend ever returns a 'userScore' field, prefer it, else fallback to 0
    return (card as any).userScore ?? 0;
  }

  vote(up: boolean): void {
    const current = this.flashcards[this.currentIndex];
    const newUserScore = up ? this.userScore(current) + 1 : this.userScore(current);

    // Only send updateScore to backend if the id is a valid UUID string
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const normalizedId = normalizeId(current.id);
    if (uuidRegex.test(normalizedId)) {
      this.flashcardService.updateScore(normalizedId, newUserScore).subscribe();
    }
    // Always update the local userScore
    (current as any).userScore = newUserScore;

    // Remove the current card
    this.flashcards.splice(this.currentIndex, 1);

    if (!up) {
      const min = this.currentIndex;
      const max = this.flashcards.length;
      const randomPos = Math.floor(Math.random() * (max - min + 1)) + min;
      // Always normalize id to string for the updated card
      const updatedCard = { ...current, id: normalizedId, userScore: newUserScore };
      this.flashcards.splice(randomPos, 0, updatedCard);
    }

    if (this.currentIndex >= this.flashcards.length) {
      this.currentIndex = 0;
    }

    this.showAnswer = false;
  }


  allPassed(): boolean {
    // Use userScore for pass logic
    return this.flashcards.every(card => this.userScore(card) > 2);
  }
}
