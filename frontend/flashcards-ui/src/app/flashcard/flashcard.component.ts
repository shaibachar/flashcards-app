import { Component, OnInit } from '@angular/core';
import { Flashcard } from '../models/flashcard';
import { FlashcardService } from '../services/flashcard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-flashcard',
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.css'],
  imports: [CommonModule, FormsModule]
})
export class FlashcardComponent implements OnInit {
  flashcards: Flashcard[] = [];
  currentIndex = 0;
  showAnswer = false;

  constructor(
    private flashcardService: FlashcardService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const deckId = this.route.snapshot.paramMap.get('deckId');
    if (!deckId) return;
    
    this.flashcardService.getRandom(deckId, 10).subscribe(cards => {
      this.flashcards = cards;
    });
  }

  flip() {
    this.showAnswer = !this.showAnswer;
  }

  vote(up: boolean): void {
    const current = this.flashcards[this.currentIndex];
    const newScore = up ? current.score + 1 : current.score;

    this.flashcardService.updateScore(current.id, newScore).subscribe(() => {
      current.score = newScore;

      // Remove the card from the current position
      this.flashcards.splice(this.currentIndex, 1);

      if (up) {
        // Move to the front of the list
        this.flashcards.unshift(current);
        this.currentIndex = 1; // Show the next card (after re-added one)
      } else {
        // Insert at a random position after current
        const min = this.currentIndex;
        const max = this.flashcards.length;
        const randomPos = Math.floor(Math.random() * (max - min)) + min;
        this.flashcards.splice(randomPos, 0, current);
        // currentIndex stays the same to move to the next card
      }

      // Reset to 0 if we've passed the end
      if (this.currentIndex >= this.flashcards.length) {
        this.currentIndex = 0;
      }

      this.showAnswer = false;
    });
  }


  allPassed(): boolean {
    return this.flashcards.every(card => card.score > 2);
  }
}
