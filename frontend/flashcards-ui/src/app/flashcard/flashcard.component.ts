import { Component, OnInit } from '@angular/core';
import { Flashcard } from '../models/flashcard';
import { FlashcardService } from '../services/flashcard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../services/translate.pipe';
import { FlashcardAnswerComponent } from './flashcard-answer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { LoggerService } from '../services/logger.service';
import { LocalScoreService } from '../services/local-score.service';

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
  imports: [CommonModule, FormsModule, TranslatePipe, FlashcardAnswerComponent]
})
export class FlashcardComponent implements OnInit {
  flashcards: Flashcard[] = [];
  currentIndex = 0;
  showAnswer = false;
  showExplanation = false;
  selectedFlashcard: Flashcard | null = null;
  fontSize = 'medium';
  apiUrl = environment.apiBaseUrl;

  constructor(
    private router: Router,
    private flashcardService: FlashcardService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private logger: LoggerService,
    private localScore: LocalScoreService
  ) {
    const user = this.auth.getCurrentUser();
    this.fontSize = user?.settings?.fontSize || 'medium';
  }

  ngOnInit(): void {
    const deckId = this.route.snapshot.paramMap.get('deckId');
    if (!deckId) {
      // Redirect or show error
      this.logger.warn('Missing deckId!');
      return;
    }

    if (deckId.startsWith('temp-')) {
      // Load temp deck from sessionStorage
      const tempDeckRaw = sessionStorage.getItem(deckId);
      if (tempDeckRaw) {
        try {
          const tempDeck = JSON.parse(tempDeckRaw);
          this.flashcards = (tempDeck.flashcards || []).map((card: any) => {
            let id: string;
            if (typeof card.id === 'string') {
              id = card.id;
            } else if (isUuidObject(card.id)) {
              id = card.id.uuid;
            } else {
              id = '';
            }
            const userScore = this.localScore.getScore(id);
            return { ...card, id, userScore } as Flashcard;
          });
        } catch (e) {
          this.logger.error('Failed to parse temp deck from sessionStorage', e);
          this.flashcards = [];
        }
      } else {
        this.flashcards = [];
      }
    } else {
      this.flashcardService.getRandom(deckId, 50).subscribe((cards: any[]) => {
        // Normalize all flashcard IDs to be strings and attach stored score
        this.flashcards = cards.map(card => {
          let id: string;
          if (typeof card.id === 'string') {
            id = card.id;
          } else if (isUuidObject(card.id)) {
            id = card.id.uuid;
          } else {
            id = '';
          }
          const userScore = this.localScore.getScore(id);
          return { ...card, id, userScore } as Flashcard;
        });
      });
    }
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

    const normalizedId = normalizeId(current.id);
    this.localScore.setScore(normalizedId, newUserScore);
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

  editCurrent() {
    const current = this.flashcards[this.currentIndex];
    if (!current) {
      return;
    }
    const id = normalizeId(current.id);
    this.router.navigate(['/manage-flashcards'], {
      queryParams: { edit: id },
      state: { editCardId: id, editCard: { ...current, id } },
    });
  }

  readAloud() {
    const card = this.flashcards[this.currentIndex];
    let text = '';
    if (this.showAnswer) {
      text = card.answer;
    } else {
      text = card.question;
    }
    if (this.showExplanation && card.explanation) {
      text += '. ' + card.explanation;
    }
    if (text) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }

  resetDeck() {
    // Reset all cards by reloading from the route
    this.currentIndex = 0;
    this.showAnswer = false;
    this.showExplanation = false;
    this.ngOnInit();
  }
}
