import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FlashcardComponent } from './flashcard/flashcard.component';
import { FlashcardScrollComponent } from './flashcard/flashcard-scroll.component';
import { HelpPageComponent } from './help-page/help-page.component';
import { AboutComponent } from './about/about.component';
import { LearningPathComponent } from './learning-path/learning-path.component';
import { FlashcardAdminComponent } from './flashcard/flashcard-admin/flashcard-admin.component';
import { FlashcardBulkImportComponent } from './flashcard-bulk-import/flashcard-bulk-import.component';
import { LoginComponent } from './auth/login.component';
import { UserAdminComponent } from './admin/user-admin.component';
import { AdminGuard } from './services/auth.guard';
import { UserSettingsComponent } from './user/user-settings.component';
import { ImageManagerComponent } from './image-manager/image-manager.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'deck/:deckId', component: FlashcardComponent },
  { path: 'scroll/:deckId', component: FlashcardScrollComponent },
  { path: 'manage-flashcards', component: FlashcardAdminComponent },
  { path: 'manage-images', component: ImageManagerComponent },
  { path: 'learning-paths', component: LearningPathComponent },
  { path: 'about', component: HelpPageComponent },
  { path: 'help', component: AboutComponent },
  { path: 'bulk-import', component: FlashcardBulkImportComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin/users', component: UserAdminComponent, canActivate: [AdminGuard] },
  { path: 'settings', component: UserSettingsComponent },
  { path: '**', redirectTo: '' }
];
