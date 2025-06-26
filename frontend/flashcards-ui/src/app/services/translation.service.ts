import { Injectable } from '@angular/core';
import en from '../../assets/i18n/en.json';
import he from '../../assets/i18n/he.json';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  lang: 'en' | 'he' = 'en';

  translations: Record<'en' | 'he', Record<string, string>> = {
    en,
    he
  };

  toggle(): void {
    this.lang = this.lang === 'en' ? 'he' : 'en';
  }

  t(key: string): string {
    return this.translations[this.lang][key] || key;
  }

  currentLang(): string {
    return this.lang;
  }
}
