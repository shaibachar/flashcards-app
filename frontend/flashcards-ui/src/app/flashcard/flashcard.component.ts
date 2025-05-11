import { Component, OnInit } from '@angular/core';
import { Flashcard } from '../models/flashcard';
import { FlashcardService } from '../services/flashcard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(private flashcardService: FlashcardService) { }

  ngOnInit() {
    this.flashcardService.getRandom().subscribe(cards => {
      console.log('Flashcards loaded:', cards);
      this.flashcards = cards;
    });
  }

  flip() {
    this.showAnswer = !this.showAnswer;
  }

  vote(up: boolean) {
    const current = this.flashcards[this.currentIndex];
    const newScore = up ? current.score + 1 : current.score;
    this.flashcardService.updateScore(current.id, newScore).subscribe(() => {
      current.score = newScore;
      // Remove from current position
      this.flashcards.splice(this.currentIndex, 1);

      if (up) {
        this.flashcards.unshift(current);
        this.currentIndex = 0;
      } else {
        const randomPos = Math.floor(Math.random() * (this.flashcards.length - this.currentIndex) + this.currentIndex);
        this.flashcards.splice(randomPos, 0, current);
        this.currentIndex++;
      }

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
