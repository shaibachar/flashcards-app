import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Flashcard } from '../models/flashcard';
import { FlashcardService } from '../services/flashcard.service';
import { FlashcardAnswerComponent } from './flashcard-answer.component';
import { TranslatePipe } from '../services/translate.pipe';
import { environment } from '../../environments/environment';
import { LoggerService } from '../services/logger.service';
import { LocalScoreService } from '../services/local-score.service';

@Component({
  selector: 'app-flashcard-scroll',
  standalone: true,
  imports: [CommonModule, FlashcardAnswerComponent, TranslatePipe],
  templateUrl: './flashcard-scroll.component.html',
  styleUrls: ['./flashcard-scroll.component.css']
})
export class FlashcardScrollComponent implements OnInit {
  flashcards: Flashcard[] = [];
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
          this.flashcards = (temp.flashcards || []).map((card: any) => ({
            ...(card || {}),
            id: typeof card.id === 'string' ? card.id : card.id?.uuid || '',
            userScore: this.localScore.getScore(
              typeof card.id === 'string' ? card.id : card.id?.uuid || ''
            )
          }));
        } catch (e) {
          this.logger.error('Failed to parse temp deck', e);
        }
      }
    } else {
      this.flashcardService.getRandom(deckId, 50).subscribe(cards => {
        this.flashcards = cards.map(card => ({
          ...card,
          id: typeof card.id === 'string' ? card.id : (card as any).id?.uuid || '',
          userScore: this.localScore.getScore(
            typeof card.id === 'string' ? card.id : (card as any).id?.uuid || ''
          )
        }));
      });
    }
  }
}
