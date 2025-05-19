import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { HelpPageComponent } from './help-page/help-page.component';
import { AboutComponent } from './about/about.component';
import { LearningPathComponent } from './learning-path/learning-path.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'deck/:deckId', component: FlashcardComponent },
  { path: 'learning-paths', component: LearningPathComponent },
  { path: 'about', component: HelpPageComponent },
  { path: 'help', component: AboutComponent },
  { path: '**', redirectTo: '' }
];
