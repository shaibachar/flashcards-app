export interface UserSettings {
  fontSize?: string;
  flashcardFontSize?: number;
}

import { UserRole } from './user-role';

export interface User {
  id: string;
  username: string;
  roles: UserRole[];
  settings: UserSettings;
}
