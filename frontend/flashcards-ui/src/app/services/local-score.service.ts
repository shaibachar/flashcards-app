import { Injectable } from '@angular/core';

export interface ScoreStats {
  up: number;
  down: number;
}

type StoredScore = number | ScoreStats | undefined;

@Injectable({ providedIn: 'root' })
export class LocalScoreService {
  private storageKey = 'flashcardScores';

  private loadRaw(): Record<string, StoredScore> {
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

  private normalizeScores(): Record<string, ScoreStats> {
    const raw = this.loadRaw();
    const normalized: Record<string, ScoreStats> = {};
    Object.keys(raw).forEach(key => {
      const value = raw[key];
      if (typeof value === 'number') {
        normalized[key] = { up: value, down: 0 };
      } else if (value && typeof value === 'object') {
        const up = typeof value.up === 'number' ? value.up : 0;
        const down = typeof value.down === 'number' ? value.down : 0;
        normalized[key] = { up, down };
      }
    });
    return normalized;
  }

  private save(scores: Record<string, ScoreStats>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(scores));
  }

  getScore(id: string): number {
    return this.getStats(id).up;
  }

  getStats(id: string): ScoreStats {
    const scores = this.normalizeScores();
    return scores[id] ?? { up: 0, down: 0 };
  }

  setScore(id: string, score: number): void {
    const scores = this.normalizeScores();
    const existing = scores[id] ?? { up: 0, down: 0 };
    scores[id] = { ...existing, up: score };
    this.save(scores);
  }

  recordVote(id: string, upVote: boolean): ScoreStats {
    const scores = this.normalizeScores();
    const current = scores[id] ?? { up: 0, down: 0 };
    const updated = {
      up: upVote ? current.up + 1 : current.up,
      down: upVote ? current.down : current.down + 1,
    };
    scores[id] = updated;
    this.save(scores);
    return updated;
  }
}
