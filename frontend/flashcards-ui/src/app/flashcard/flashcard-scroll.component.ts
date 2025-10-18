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
  private touchStart?: { 
    x: number; 
    y: number; 
    card: ScrollCard;
    time: number;
  };
  private currentSwipeOffset = 0;
  private isScrolling = false;

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

  onTouchStart(event: TouchEvent, card: ScrollCard) {
    // Don't interfere with button touches
    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) {
      this.touchStart = undefined;
      return;
    }

    const touch = event.touches[0];
    if (!touch) return;

    this.touchStart = { 
      x: touch.clientX, 
      y: touch.clientY, 
      card,
      time: Date.now()
    };
    this.isScrolling = false;
  }

  onTouchMove(event: TouchEvent, card: ScrollCard) {
    if (!this.touchStart || this.touchStart.card !== card) {
      return;
    }

    const touch = event.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - this.touchStart.x;
    const deltaY = touch.clientY - this.touchStart.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine if this is a scroll or a swipe
    if (!this.isScrolling && absX > 10 && absY > 10) {
      // User has moved enough to determine intent
      this.isScrolling = absY > absX;
    }

    // If user is scrolling vertically, allow it
    if (this.isScrolling) {
      this.currentSwipeOffset = 0;
      return;
    }

    // If horizontal swipe is detected, prevent default to stop scrolling
    if (absX > absY && absX > 10) {
      event.preventDefault();
      this.currentSwipeOffset = deltaX;
      
      // Apply visual feedback
      const element = event.currentTarget as HTMLElement | null;
      if (element) {
        const opacity = Math.max(0.7, 1 - absX / 200);
        const translateX = Math.min(Math.max(deltaX * 0.3, -100), 100);
        element.style.transform = `translateX(${translateX}px)`;
        element.style.opacity = opacity.toString();
      }
    }
  }

  onTouchEnd(event: TouchEvent, card: ScrollCard) {
    const element = event.currentTarget as HTMLElement | null;
    
    // Reset visual feedback
    if (element) {
      element.style.transform = '';
      element.style.opacity = '';
    }

    if (!this.touchStart || this.touchStart.card !== card) {
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      this.touchStart = undefined;
      this.currentSwipeOffset = 0;
      return;
    }

    const deltaX = touch.clientX - this.touchStart.x;
    const deltaY = touch.clientY - this.touchStart.y;
    const deltaTime = Date.now() - this.touchStart.time;
    
    this.touchStart = undefined;
    this.currentSwipeOffset = 0;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Calculate velocity (pixels per millisecond)
    const velocityX = deltaTime > 0 ? absX / deltaTime : 0;
    
    // Swipe threshold: 70px or high velocity (> 0.5 px/ms)
    const swipeThreshold = 70;
    const velocityThreshold = 0.5;
    
    // Check if this is a tap
    if (absX < 10 && absY < 10) {
      return;
    }

    // If user was scrolling, don't process as swipe
    if (this.isScrolling) {
      this.isScrolling = false;
      return;
    }

    // Only handle horizontal swipes (more horizontal than vertical)
    if (absX > absY && (absX > swipeThreshold || velocityX > velocityThreshold)) {
      event.preventDefault();
      
      if (deltaX > 0) {
        this.vote(card, true); // Right = passed
      } else {
        this.vote(card, false); // Left = failed
      }
    }
  }

  onTouchCancel(event: TouchEvent) {
    const element = event.currentTarget as HTMLElement | null;
    if (element) {
      element.style.transform = '';
      element.style.opacity = '';
    }
    this.touchStart = undefined;
    this.currentSwipeOffset = 0;
    this.isScrolling = false;
  }

  // Keep pointer events as fallback for desktop/non-touch devices
  onPointerStart(event: PointerEvent, card: ScrollCard) {
    // Skip if this is a touch event (will be handled by touch handlers)
    if (event.pointerType === 'touch') {
      return;
    }
    
    if (!event.isPrimary) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) {
      this.touchStart = undefined;
      return;
    }
    this.touchStart = { 
      x: event.clientX, 
      y: event.clientY, 
      card,
      time: Date.now()
    };
    const element = event.currentTarget as HTMLElement | null;
    element?.setPointerCapture?.(event.pointerId);
  }

  onPointerEnd(event: PointerEvent, card: ScrollCard) {
    // Skip if this is a touch event (will be handled by touch handlers)
    if (event.pointerType === 'touch') {
      return;
    }
    
    if (!event.isPrimary || !this.touchStart || this.touchStart.card !== card) {
      return;
    }
    const deltaX = event.clientX - this.touchStart.x;
    const deltaY = event.clientY - this.touchStart.y;
    this.touchStart = undefined;
    const element = event.currentTarget as HTMLElement | null;
    if (element?.hasPointerCapture?.(event.pointerId)) {
      element.releasePointerCapture?.(event.pointerId);
    }

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const swipeThreshold = 50;

    // Check if this is a tap (very small movement) - but do nothing
    // We removed double-tap to avoid Safari zoom issues
    if (absX < 10 && absY < 10) {
      return;
    }

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
    if (event?.pointerType === 'touch') {
      return;
    }
    if (event?.currentTarget instanceof HTMLElement && event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    this.touchStart = undefined;
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

  hasAnyAnswerShown(): boolean {
    return this.flashcards.some(card => card.showAnswer);
  }
}
