import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from '../menu/menu.component';
import { FormsModule } from '@angular/forms';
import { LearningPathService } from '../services/learning-path.service';
import { LearningPath } from '../models/learningPath';
import { Flashcard } from '../models/flashcard';
import { FlashcardService } from '../services/flashcard.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent, HttpClientModule],
  templateUrl: './learning-path.component.html',
  styleUrl: './learning-path.component.css'
})
export class LearningPathComponent implements OnInit {
  flashcards: Flashcard[] = [];
  filteredFlashcards: Flashcard[] = [];
  selectedCardIds: string[] = [];
  filterText = '';
  learningPaths: LearningPath[] = [];
  newPath: LearningPath = { id: '', name: '', description: '', cardIds: [], topics: [] };

  constructor(private learningPathService: LearningPathService,
    private flashcardService: FlashcardService) { }

  // Initialize the component and load learning paths and flashcards
  ngOnInit(): void {
    this.learningPathService.getAll().subscribe(paths => this.learningPaths = paths);
    this.flashcardService.getAll().subscribe(cards => {
      this.flashcards = cards;
      this.filteredFlashcards = cards;
    });
  }

  // Add a new learning path with selected flashcards
  addPath(): void {
    if (this.newPath.name.trim()) {
      const selectedCards = this.flashcards.filter(card => this.selectedCardIds.includes(card.id));

      const topics = [...new Set(selectedCards.map(c => c.deckId).filter(Boolean))]; // remove empty

      const payload: LearningPath = {
        ...this.newPath,
        cardIds: this.selectedCardIds,
        topics
      };

      this.learningPathService.add(payload).subscribe(() => {
        this.learningPathService.getAll().subscribe(paths => this.learningPaths = paths);
        this.newPath = { id: '', name: '', description: '', cardIds: [], topics: [] };
        this.selectedCardIds = [];
        this.filterText = '';
      });
    }
  }

  // Filter flashcards based on the input text
  applyFilter(): void {
    const keyword = this.filterText.toLowerCase();
    this.filteredFlashcards = this.flashcards.filter(card =>
      card.topic.toLowerCase().includes(keyword)
    );
  }

  // Toggle selection of a flashcard
  toggleCardSelection(id: string): void {
    if (this.selectedCardIds.includes(id)) {
      this.selectedCardIds = this.selectedCardIds.filter(c => c !== id);
    } else {
      this.selectedCardIds.push(id);
    }
  }

  // Check if a flashcard is selected
  deletePath(id: string): void {
    this.learningPathService.delete(id).subscribe(() => {
      this.learningPathService.getAll().subscribe(paths => this.learningPaths = paths);
    });
  }

  updatePath(path: LearningPath): void {
    this.learningPathService.update(path).subscribe(() => {
      this.learningPathService.getAll().subscribe(paths => this.learningPaths = paths);
    });
  }
}