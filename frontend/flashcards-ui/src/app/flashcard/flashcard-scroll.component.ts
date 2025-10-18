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
    element: HTMLElement;
  };
  private currentSwipeOffset = 0;
  private isScrolling = false;
  private swipeDirection: 'left' | 'right' | null = null;

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

    // Don't interfere with scrollable content
    if (target?.closest('.content-wrapper.scrollable')) {
      // Check if the content is actually scrollable
      const scrollableEl = target.closest('.content-wrapper.scrollable') as HTMLElement;
      if (scrollableEl && scrollableEl.scrollHeight > scrollableEl.clientHeight) {
        // Content is scrollable, let it scroll
        this.touchStart = undefined;
        return;
      }
    }

    const touch = event.touches[0];
    if (!touch) return;

    const element = event.currentTarget as HTMLElement;

    this.touchStart = { 
      x: touch.clientX, 
      y: touch.clientY, 
      card,
      time: Date.now(),
      element
    };
    this.isScrolling = false;
    this.swipeDirection = null;
    this.currentSwipeOffset = 0;
    
    // Add transition class for smooth animations
    element.classList.add('swiping');
  }

  onTouchMove(event: TouchEvent, card: ScrollCard) {
    if (!this.touchStart || this.touchStart.card !== card) {
      return;
    }

    const touch = event.touches[0];
    if (!touch) return;

    // Check if we're in scrollable content
    const target = event.target as HTMLElement | null;
    const scrollableEl = target?.closest('.content-wrapper.scrollable') as HTMLElement | null;
    
    const deltaX = touch.clientX - this.touchStart.x;
    const deltaY = touch.clientY - this.touchStart.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine if this is a scroll or a swipe early (at 5px threshold)
    if (!this.isScrolling && this.swipeDirection === null && (absX > 5 || absY > 5)) {
      if (absY > absX * 1.5) {
        // Clear vertical movement - check if it's scrollable content
        if (scrollableEl && scrollableEl.scrollHeight > scrollableEl.clientHeight) {
          // Allow scrolling in scrollable content
          this.isScrolling = true;
          this.resetSwipeVisuals();
          return;
        } else {
          // Not scrollable or not in scrollable area, treat as potential scroll between cards
          this.isScrolling = true;
          this.resetSwipeVisuals();
          return;
        }
      } else if (absX > absY * 1.5) {
        // Clear horizontal movement - it's swiping
        this.isScrolling = false;
        this.swipeDirection = deltaX > 0 ? 'right' : 'left';
      }
    }

    // If user is scrolling vertically, allow it
    if (this.isScrolling) {
      this.currentSwipeOffset = 0;
      return;
    }

    // If horizontal swipe is detected, prevent default to stop scrolling
    if (absX > absY && absX > 5) {
      event.preventDefault();
      event.stopPropagation();
      this.currentSwipeOffset = deltaX;
      
      // Update swipe direction
      this.swipeDirection = deltaX > 0 ? 'right' : 'left';
      
      // Apply visual feedback with improved animations
      const element = this.touchStart.element;
      if (element) {
        // Smoother opacity transition
        const opacity = Math.max(0.6, 1 - absX / 250);
        
        // Enhanced translation with better scaling
        const translateX = deltaX * 0.4;
        const scale = Math.max(0.95, 1 - absX / 400);
        const rotation = deltaX * 0.05; // Slight rotation for better feedback
        
        // Add color overlay based on direction
        const overlayOpacity = Math.min(absX / 150, 0.3);
        
        element.style.transform = `translateX(${translateX}px) scale(${scale}) rotate(${rotation}deg)`;
        element.style.opacity = opacity.toString();
        
        // Add background color feedback
        if (this.swipeDirection === 'right') {
          element.style.backgroundColor = `rgba(76, 175, 80, ${overlayOpacity})`; // Green
        } else {
          element.style.backgroundColor = `rgba(244, 67, 54, ${overlayOpacity})`; // Red
        }
        
        // Vibrate on threshold cross (once per swipe)
        if (absX > 70 && !element.dataset['vibrated']) {
          this.triggerHapticFeedback('light');
          element.dataset['vibrated'] = 'true';
        }
      }
    }
  }

  onTouchEnd(event: TouchEvent, card: ScrollCard) {
    const element = event.currentTarget as HTMLElement | null;
    
    if (!this.touchStart || this.touchStart.card !== card) {
      this.resetSwipeVisuals();
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      this.touchStart = undefined;
      this.currentSwipeOffset = 0;
      this.swipeDirection = null;
      this.resetSwipeVisuals();
      return;
    }

    const deltaX = touch.clientX - this.touchStart.x;
    const deltaY = touch.clientY - this.touchStart.y;
    const deltaTime = Date.now() - this.touchStart.time;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    // Calculate velocity (pixels per millisecond)
    const velocityX = deltaTime > 0 ? absX / deltaTime : 0;
    
    // Improved thresholds
    const swipeThreshold = 60; // Reduced from 70 for better responsiveness
    const velocityThreshold = 0.4; // Reduced from 0.5 for easier fast flicks
    
    // Check if this is a tap
    if (absX < 10 && absY < 10) {
      this.resetSwipeVisuals();
      this.touchStart = undefined;
      this.currentSwipeOffset = 0;
      this.swipeDirection = null;
      return;
    }

    // If user was scrolling, don't process as swipe
    if (this.isScrolling) {
      this.resetSwipeVisuals();
      this.isScrolling = false;
      this.touchStart = undefined;
      this.currentSwipeOffset = 0;
      this.swipeDirection = null;
      return;
    }

    // Only handle horizontal swipes (more horizontal than vertical)
    if (absX > absY && (absX > swipeThreshold || velocityX > velocityThreshold)) {
      event.preventDefault();
      
      // Trigger haptic feedback on successful swipe
      this.triggerHapticFeedback('medium');
      
      // Animate card flying off
      if (element) {
        const direction = deltaX > 0 ? 1 : -1;
        element.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        element.style.transform = `translateX(${direction * 150}%) scale(0.8) rotate(${direction * 15}deg)`;
        element.style.opacity = '0';
      }
      
      // Delay the vote to allow animation
      setTimeout(() => {
        if (deltaX > 0) {
          this.vote(card, true); // Right = passed
        } else {
          this.vote(card, false); // Left = failed
        }
        this.resetSwipeVisuals();
      }, 150);
      
      this.touchStart = undefined;
      this.currentSwipeOffset = 0;
      this.swipeDirection = null;
    } else {
      // Not enough swipe distance/velocity - snap back
      if (element) {
        element.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease';
        this.resetSwipeVisuals();
      }
      
      this.touchStart = undefined;
      this.currentSwipeOffset = 0;
      this.swipeDirection = null;
    }
  }

  onTouchCancel(event: TouchEvent) {
    this.resetSwipeVisuals();
    this.touchStart = undefined;
    this.currentSwipeOffset = 0;
    this.swipeDirection = null;
    this.isScrolling = false;
  }

  private resetSwipeVisuals() {
    if (this.touchStart?.element) {
      const element = this.touchStart.element;
      element.style.transform = '';
      element.style.opacity = '';
      element.style.backgroundColor = '';
      element.classList.remove('swiping');
      delete element.dataset['vibrated'];
    }
  }

  private triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy' = 'light') {
    // Check if the Vibration API is supported
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30
      };
      navigator.vibrate(patterns[intensity]);
    }
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
    
    const element = event.currentTarget as HTMLElement;
    
    this.touchStart = { 
      x: event.clientX, 
      y: event.clientY, 
      card,
      time: Date.now(),
      element
    };
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
      this.touchStart = undefined;
      return;
    }

    // Require minimum swipe distance
    if (absX < swipeThreshold && absY < swipeThreshold) {
      this.touchStart = undefined;
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
    
    this.touchStart = undefined;
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
