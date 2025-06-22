import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LearningPathService } from '../services/learning-path.service';
import { LearningPath } from '../models/LearningPath';
import { Flashcard } from '../models/flashcard';
import { FlashcardService } from '../services/flashcard.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
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
      // Normalize all selectedCardIds to strings in case any are objects or stringified objects
      const normalizedCardIds = this.selectedCardIds.map(normalizeId);
      const selectedCards = this.flashcards.filter(card => normalizedCardIds.includes(normalizeId(card.id)));
      const topics = [...new Set(selectedCards.map(c => c.deckId).filter(Boolean))]; // remove empty
      const payload: LearningPath = {
        ...this.newPath,
        cardIds: normalizedCardIds,
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

function normalizeId(id: unknown): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof id === 'string') {
    if (uuidRegex.test(id)) return id;
    try {
      const parsed = JSON.parse(id);
      if (parsed && typeof parsed.uuid === 'string') return parsed.uuid;
    } catch {
      // Not a JSON string, fall through
    }
  }
  if (typeof id === 'object' && id !== null && 'uuid' in id && typeof (id as any).uuid === 'string') {
    return (id as any).uuid;
  }
  return '';
}