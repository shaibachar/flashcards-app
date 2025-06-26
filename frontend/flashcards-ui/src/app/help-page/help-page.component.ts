import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../services/translate.pipe';
import { FlashcardService } from '../services/flashcard.service';

@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.css'
})
export class HelpPageComponent {
  constructor(private flashcardService: FlashcardService) {}

  reloadAll() {
    this.flashcardService.getAll().subscribe({
      next: (res) => alert(res?.length || 'Flashcards reloaded.'),
      error: (err) =>
        alert('Failed to reload: ' + (err.error?.message || err.message || err))
    });
  }
}
