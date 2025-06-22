export interface UserSettings {
  fontSize?: string;
}

import { UserRole } from './user-role';

export interface User {
  id: string;
  username: string;
  roles: UserRole[];
  settings: UserSettings;
}
