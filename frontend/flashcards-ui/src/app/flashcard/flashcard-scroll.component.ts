import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private route: ActivatedRoute,
    private flashcardService: FlashcardService,
    private logger: LoggerService,
    private localScore: LocalScoreService
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
    const stats = this.localScore.recordVote(card.id, up);
    card.userScore = stats.up;
    card.stats = stats;
    card.showAnswer = false;
    this.flashcards.splice(index, 1);
    if (!up) {
      const min = index;
      const max = this.flashcards.length;
      const randomPos = Math.floor(Math.random() * (max - min + 1)) + min;
      this.flashcards.splice(randomPos, 0, card);
    }
  }

  toggleAnswer(card: ScrollCard) {
    card.showAnswer = !card.showAnswer;
  }

  onPointerStart(event: PointerEvent, card: ScrollCard) {
    this.pointerStart = { x: event.clientX, y: event.clientY, card };
  }

  onPointerEnd(event: PointerEvent, card: ScrollCard) {
    if (!this.pointerStart || this.pointerStart.card !== card) {
      return;
    }
    const deltaX = event.clientX - this.pointerStart.x;
    const deltaY = event.clientY - this.pointerStart.y;
    this.pointerStart = undefined;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const threshold = 50;

    if (absX > absY && absX > threshold) {
      this.vote(card, deltaX > 0);
    } else if (absY > absX && deltaY < -threshold) {
      this.toggleAnswer(card);
    }
  }

  onPointerCancel() {
    this.pointerStart = undefined;
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
}
