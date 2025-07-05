import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Flashcard } from '../models/flashcard';
import { FlashcardService } from '../services/flashcard.service';
import { FlashcardAnswerComponent } from './flashcard-answer.component';
import { MenuComponent } from '../menu/menu.component';
import { environment } from '../../environments/environment';
import { LoggerService } from '../services/logger.service';
import { LocalScoreService } from '../services/local-score.service';

export interface ScrollCard extends Flashcard {
  userScore?: number;
}

@Component({
  selector: 'app-flashcard-scroll',
  standalone: true,
  imports: [CommonModule, FlashcardAnswerComponent, MenuComponent],
  templateUrl: './flashcard-scroll.component.html',
  styleUrls: ['./flashcard-scroll.component.css']
})
export class FlashcardScrollComponent implements OnInit {
  flashcards: ScrollCard[] = [];
  apiUrl = environment.apiBaseUrl;

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
    return {
      ...(raw || {}),
      id,
      userScore: this.localScore.getScore(id),
      showAnswer: true,
    } as ScrollCard;
  }

  userScoreOf(card: ScrollCard): number {
    return (card as any).userScore ?? 0;
  }

  vote(card: ScrollCard, up: boolean) {
    const index = this.flashcards.indexOf(card);
    const newScore = up ? this.userScoreOf(card) + 1 : this.userScoreOf(card);
    this.localScore.setScore(card.id, newScore);
    card.userScore = newScore;
    this.flashcards.splice(index, 1);
    if (!up) {
      const min = index;
      const max = this.flashcards.length;
      const randomPos = Math.floor(Math.random() * (max - min + 1)) + min;
      this.flashcards.splice(randomPos, 0, card);
    }
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
