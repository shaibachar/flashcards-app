import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { HelpPageComponent } from './help-page/help-page.component';
import { AboutComponent } from './about/about.component';
import { LearningPathComponent } from './learning-path/learning-path.component';
import { FlashcardAdminComponent } from './flashcard/flashcard-admin/flashcard-admin.component';
import { FlashcardBulkImportComponent } from './flashcard-bulk-import/flashcard-bulk-import.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'deck/:deckId', component: FlashcardComponent },
  { path: 'manage-flashcards', component: FlashcardAdminComponent },
  { path: 'learning-paths', component: LearningPathComponent },
  { path: 'about', component: HelpPageComponent },
  { path: 'help', component: AboutComponent },
  { path: 'bulk-import', component: FlashcardBulkImportComponent },
  { path: '**', redirectTo: '' }
];
