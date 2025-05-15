import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FlashcardComponent } from './flashcard/flashcard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'deck/:deckId', component: FlashcardComponent },
  { path: '**', redirectTo: '' }
];
