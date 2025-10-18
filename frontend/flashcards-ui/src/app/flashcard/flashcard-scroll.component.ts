import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Flashcard } from '../models/flashcard';
import { FlashcardService } from '../services/flashcard.service';
import { FlashcardAnswerComponent } from './flashcard-answer.component';
import { environment } from '../../environments/environment';
import { LoggerService } from '../services/logger.service';
import { LocalScoreService, ScoreStats } from '../services/local-score.service';

export interface ScrollCard extends Flashcard {
  userScore?: number;
  stats?: ScoreStats;
  showAnswer?: boolean;
}

@Component({
  selector: 'app-flashcard-scroll',
  standalone: true,
  imports: [CommonModule, FlashcardAnswerComponent],
  templateUrl: './flashcard-scroll.component.html',
  styleUrls: ['./flashcard-scroll.component.css']
})
export class FlashcardScrollComponent implements OnInit {
  flashcards: ScrollCard[] = [];
  apiUrl = environment.apiBaseUrl;
  private pointerStart?: { x: number; y: number; card: ScrollCard };
  private lastTapTime = 0;

  constructor(
    private route: ActivatedRoute,
    private flashcardService: FlashcardService,
    private logger: LoggerService,
    private localScore: LocalScoreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const deckId = this.route.snapshot.paramMap.get('deckId');
    if (!deckId) {
      this.logger.warn('Missing deckId!');
      return;
    }

    if (deckId.startsWith('temp-')) {
      const raw = sessionStorage.getItem(deckId);
      if (raw) {
        try {
          const temp = JSON.parse(raw);
          this.flashcards = (temp.flashcards || []).map((card: any) => this.enhanceCard(card));
        } catch (e) {
          this.logger.error('Failed to parse temp deck', e);
        }
      }
    } else {
      this.flashcardService.getRandom(deckId, 50).subscribe(cards => {
        this.flashcards = cards.map(card => this.enhanceCard(card));
      });
    }
  }

  private enhanceCard(raw: any): ScrollCard {
    const id = typeof raw.id === 'string' ? raw.id : raw.id?.uuid || '';
    const stats = this.localScore.getStats(id);
    return {
      ...(raw || {}),
      id,
      userScore: stats.up,
      stats,
      showAnswer: false,
    } as ScrollCard;
  }

  vote(card: ScrollCard, up: boolean) {
    const index = this.flashcards.indexOf(card);
    if (index === -1) return;

    const stats = this.localScore.recordVote(card.id, up);
    card.userScore = stats.up;
    card.stats = stats;
    card.showAnswer = false;

    // Remove card from current position
    this.flashcards.splice(index, 1);

    if (!up) {
      // For failed cards, add to end
      this.flashcards.push(card);
    }

    // Force Angular to detect the change
    this.flashcards = [...this.flashcards];

    // Scroll to the next card (which is now at the same index)
    setTimeout(() => {
      const scrollWrapper = document.querySelector('.scroll-wrapper');
      const cards = document.querySelectorAll('.scroll-card');
      if (scrollWrapper && cards.length > 0) {
        const nextIndex = Math.min(index, cards.length - 1);
        cards[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  toggleAnswer(card: ScrollCard) {
    card.showAnswer = !card.showAnswer;
  }

  onPointerStart(event: PointerEvent, card: ScrollCard) {
    if (!event.isPrimary) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) {
      this.pointerStart = undefined;
      return;
    }
    this.pointerStart = { x: event.clientX, y: event.clientY, card };
    const element = event.currentTarget as HTMLElement | null;
    element?.setPointerCapture?.(event.pointerId);
  }

  onPointerEnd(event: PointerEvent, card: ScrollCard) {
    if (!event.isPrimary || !this.pointerStart || this.pointerStart.card !== card) {
      return;
    }
    const deltaX = event.clientX - this.pointerStart.x;
    const deltaY = event.clientY - this.pointerStart.y;
    this.pointerStart = undefined;
    const element = event.currentTarget as HTMLElement | null;
    if (element?.hasPointerCapture?.(event.pointerId)) {
      element.releasePointerCapture?.(event.pointerId);
    }

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const swipeThreshold = 50;

    // Check if this is a tap (very small movement)
    if (absX < 10 && absY < 10) {
      // Double-tap detection
      const currentTime = Date.now();
      const tapDelay = currentTime - this.lastTapTime;
      
      if (tapDelay < 300) {
        // Double tap detected - toggle answer
        card.showAnswer = !card.showAnswer;
        this.lastTapTime = 0; // Reset
      } else {
        // First tap
        this.lastTapTime = currentTime;
      }
      return;
    }

    // Reset tap time on swipe
    this.lastTapTime = 0;

    // Require minimum swipe distance
    if (absX < swipeThreshold && absY < swipeThreshold) {
      return;
    }

    // Only handle horizontal swipes
    if (absX > absY) {
      if (deltaX > 0) {
        this.vote(card, true); // Right = passed
      } else {
        this.vote(card, false); // Left = failed
      }
    }
  }

  onPointerCancel(event?: PointerEvent) {
    if (event?.currentTarget instanceof HTMLElement && event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    this.pointerStart = undefined;
  }

  editCard(card: ScrollCard) {
    if (!card || !card.id) {
      return;
    }
    this.router.navigate(['/manage-flashcards'], {
      queryParams: { edit: card.id },
      state: { editCardId: card.id, editCard: card },
    });
  }

  readAloud(card: ScrollCard) {
    let text = card.question;
    if (card.answer) {
      text += '. ' + card.answer;
    }
    if (card.explanation) {
      text += '. ' + card.explanation;
    }
    if (text) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }

  trackByCardId(index: number, card: ScrollCard) {
    return card.id || index;
  }
}
