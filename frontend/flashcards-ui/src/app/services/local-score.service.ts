import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalScoreService {
  private storageKey = 'flashcardScores';

  private load(): Record<string, number> {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return {};
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  private save(scores: Record<string, number>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(scores));
  }

  getScore(id: string): number {
    return this.load()[id] ?? 0;
  }

  setScore(id: string, score: number): void {
    const scores = this.load();
    scores[id] = score;
    this.save(scores);
  }
}
