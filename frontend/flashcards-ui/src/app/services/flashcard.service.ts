import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Flashcard } from '../models/flashcard';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';

const API_BASE_URL = environment.apiBaseUrl;

function isUuidObject(id: unknown): id is { uuid: string } {
  return (
    typeof id === 'object' && id !== null && 'uuid' in id && typeof (id as any).uuid === 'string'
  );
}

function normalizeId(id: unknown): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof id === 'string') {
    if (uuidRegex.test(id)) return id;
    try {
      const parsed = JSON.parse(id);
      if (parsed && typeof parsed.uuid === 'string') return parsed.uuid;
    } catch {
      // Not a JSON string, fall through
    }
  }
  if (typeof id === 'object' && id !== null && 'uuid' in id && typeof (id as any).uuid === 'string') {
    return (id as any).uuid;
  }
  return '';
}

@Injectable({ providedIn: 'root' })
export class FlashcardService {
  private apiUrl = `${API_BASE_URL}/flashcards`;

  constructor(private http: HttpClient, private logger: LoggerService) {}

  getAll(): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(this.apiUrl);
  }

  create(card: Flashcard): Observable<Flashcard> {
    // Always normalize id before sending
    const normalizedCard = { ...card, id: normalizeId(card.id) };
    return this.http.post<Flashcard>(this.apiUrl, normalizedCard);
  }

  update(card: Flashcard): Observable<Flashcard> {
    const normalizedId = normalizeId(card.id);
    const normalizedCard = { ...card, id: String(normalizedId) };
    this.logger.info('PUT URL:', `${this.apiUrl}/${normalizedId}`);
    this.logger.info('PUT payload:', normalizedCard);
    return this.http.put<Flashcard>(`${this.apiUrl}/${normalizedId}`, normalizedCard);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${normalizeId(id)}`);
  }

  getRandom(deckId: string, count = 50): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(`${this.apiUrl}/${deckId}/random?count=${count}`);
  }

  updateScore(id: string, score: number): Observable<void> {
    const normalizedId = normalizeId(id);
    return this.http.patch<void>(`${this.apiUrl}/${normalizedId}/score`, score);
  }

  updateFlashcard(card: Flashcard): Observable<Flashcard> {
    const normalizedId = normalizeId(card.id);
    const normalizedCard = { ...card, id: String(normalizedId) };
    this.logger.info('PUT URL:', `${this.apiUrl}/${normalizedId}`);
    this.logger.info('PUT payload:', normalizedCard);
    return this.http.put<Flashcard>(`${this.apiUrl}/${normalizedId}`, normalizedCard);
  }

  deleteFlashcard(id: string): Observable<void> {
    return this.delete(normalizeId(id));
  }

  generate(question: string): Observable<Flashcard> {
    return this.http.post<Flashcard>(`${API_BASE_URL}/api/generate/flashcards`, {
      question,
    });
  }

  reloadFromDb(): Observable<any> {
    return this.http.post(`${this.apiUrl}/seed`, {});
  }

  cleanup(): Observable<{ fixed: number }> {
    return this.http.post<{ fixed: number }>(`${this.apiUrl}/cleanup`, {});
  }
}
