import { Component, OnInit } from '@angular/core';
import { Flashcard } from '../models/flashcard';
import { FlashcardService } from '../services/flashcard.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';

@Component({
  standalone: true,
  selector: 'app-flashcard',
  templateUrl: './flashcard.component.html',
  styleUrls: ['./flashcard.component.css'],
  imports: [CommonModule, FormsModule, MenuComponent]
})
export class FlashcardComponent implements OnInit {
  flashcards: Flashcard[] = [];
  currentIndex = 0;
  showAnswer = false;
  showExplanation = false;
  selectedFlashcard: Flashcard | null = null;

  constructor(
    private router: Router,
    private flashcardService: FlashcardService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const deckId = this.route.snapshot.paramMap.get('deckId');
    if (!deckId) {
      // Redirect or show error
      console.warn('Missing deckId!');
      return;
    }

    this.flashcardService.getRandom(deckId, 50).subscribe(cards => {
      this.flashcards = cards;
    });
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
    // Use userScore for frontend progress, not the backend 'score' field
    const newUserScore = up ? this.userScore(current) + 1 : this.userScore(current);

    // Optionally, you can still send the update to the backend if you want to persist progress
    // this.flashcardService.updateScore(current.id, newUserScore).subscribe(() => { ... })
    // But if you want to keep it frontend-only, just update the local object:
    (current as any).userScore = newUserScore;

    // Remove the current card
    this.flashcards.splice(this.currentIndex, 1);

    if (!up) {
      // Thumbs down → reinsert at a random later position
      const min = this.currentIndex;
      const max = this.flashcards.length;
      const randomPos = Math.floor(Math.random() * (max - min + 1)) + min;
      const updatedCard = { ...current, userScore: newUserScore };
      this.flashcards.splice(randomPos, 0, updatedCard);
    }

    // Adjust index if needed
    if (this.currentIndex >= this.flashcards.length) {
      this.currentIndex = 0;
    }

    this.showAnswer = false;
  }


  allPassed(): boolean {
    // Use userScore for pass logic
    return this.flashcards.every(card => this.userScore(card) > 2);
  }
}
