import { Component } from '@angular/core';
import { FlashcardComponent } from './flashcard/flashcard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FlashcardComponent],
  template: `<app-flashcard></app-flashcard>`,
})
export class AppComponent {
  title = 'flashcards-ui';
}
