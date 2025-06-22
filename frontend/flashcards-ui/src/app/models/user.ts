export interface UserSettings {
  fontSize?: string;
}

export interface User {
  id: string;
  username: string;
  roles: string[];
  settings: UserSettings;
}
