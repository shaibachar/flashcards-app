import { IonicModule } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { Flashcard } from '../models/flashcard';
import { FlashcardService } from '../services/flashcard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../services/translate.pipe';
import { FlashcardAnswerComponent } from './flashcard-answer.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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
  imports: [IonicModule, CommonModule, FormsModule, TranslatePipe, FlashcardAnswerComponent]
})
export class FlashcardComponent implements OnInit {
  flashcards: Flashcard[] = [];
  currentIndex = 0;
  showAnswer = false;
  showExplanation = false;
  selectedFlashcard: Flashcard | null = null;
  fontSize = 'medium';

  constructor(
    private router: Router,
    private flashcardService: FlashcardService,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {
    const user = this.auth.getCurrentUser();
    this.fontSize = user?.settings?.fontSize || 'medium';
    console.log('[FlashcardComponent] constructor fontSize', this.fontSize);
  }

  ngOnInit(): void {
    const deckId = this.route.snapshot.paramMap.get('deckId');
    console.log('[FlashcardComponent] ngOnInit deckId', deckId);
    if (!deckId) {
      // Redirect or show error
      console.warn('Missing deckId!');
      return;
    }

    if (deckId.startsWith('temp-')) {
      // Load temp deck from sessionStorage
      const tempDeckRaw = sessionStorage.getItem(deckId);
      if (tempDeckRaw) {
        try {
          const tempDeck = JSON.parse(tempDeckRaw);
          console.log('[FlashcardComponent] loaded temp deck from sessionStorage', tempDeck);
          this.flashcards = (tempDeck.flashcards || []).map((card: any) => {
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
        } catch (e) {
          console.error('Failed to parse temp deck from sessionStorage', e);
          this.flashcards = [];
        }
      } else {
        console.warn('[FlashcardComponent] temp deck not found in sessionStorage');
        this.flashcards = [];
      }
    } else {
      console.log('[FlashcardComponent] loading random flashcards for deck', deckId);
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
  }

  flip() {
    this.showAnswer = !this.showAnswer;
    this.showExplanation = false;
    console.log('[FlashcardComponent] flip -> showAnswer', this.showAnswer);

  }

  // Use a separate field for user progress, to avoid conflict with vector score
  userScore(card: Flashcard): number {
    // If the backend ever returns a 'userScore' field, prefer it, else fallback to 0
    return (card as any).userScore ?? 0;
  }

  vote(up: boolean): void {
    console.log('[FlashcardComponent] vote', up);
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
    console.log('[FlashcardComponent] updated userScore', newUserScore);

    // Remove the current card
    this.flashcards.splice(this.currentIndex, 1);
    console.log('[FlashcardComponent] removed current card, remaining', this.flashcards.length);

    if (!up) {
      const min = this.currentIndex;
      const max = this.flashcards.length;
      const randomPos = Math.floor(Math.random() * (max - min + 1)) + min;
      // Always normalize id to string for the updated card
      const updatedCard = { ...current, id: normalizedId, userScore: newUserScore };
      this.flashcards.splice(randomPos, 0, updatedCard);
      console.log('[FlashcardComponent] reinserted card at', randomPos);
    }

    if (this.currentIndex >= this.flashcards.length) {
      this.currentIndex = 0;
      console.log('[FlashcardComponent] reset currentIndex to 0');
    }

    this.showAnswer = false;
    console.log('[FlashcardComponent] hiding answer after vote');
  }


  allPassed(): boolean {
    // Use userScore for pass logic
    const passed = this.flashcards.every(card => this.userScore(card) > 2);
    console.log('[FlashcardComponent] allPassed ->', passed);
    return passed;
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
      console.log('[FlashcardComponent] readAloud', text);
      window.speechSynthesis.speak(utterance);
    }
  }
}
