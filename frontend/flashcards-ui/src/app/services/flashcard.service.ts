import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Flashcard } from '../models/flashcard';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

  constructor(private http: HttpClient) {}

  getAll(): Observable<Flashcard[]> {
    console.log('[FlashcardService] GET all flashcards', this.apiUrl);
    return this.http.get<Flashcard[]>(this.apiUrl);
  }

  create(card: Flashcard): Observable<Flashcard> {
    // Always normalize id before sending
    const normalizedCard = { ...card, id: normalizeId(card.id) };
    console.log('[FlashcardService] CREATE flashcard', normalizedCard);
    return this.http.post<Flashcard>(this.apiUrl, normalizedCard);
  }

  update(card: Flashcard): Observable<Flashcard> {
    const normalizedId = normalizeId(card.id);
    const normalizedCard = { ...card, id: String(normalizedId) };
    console.log('[FlashcardService] UPDATE URL:', `${this.apiUrl}/${normalizedId}`);
    console.log('[FlashcardService] UPDATE payload:', normalizedCard);
    return this.http.put<Flashcard>(`${this.apiUrl}/${normalizedId}`, normalizedCard);
  }

  delete(id: string): Observable<void> {
    const url = `${this.apiUrl}/${normalizeId(id)}`;
    console.log('[FlashcardService] DELETE', url);
    return this.http.delete<void>(url);
  }

  getRandom(deckId: string, count = 50): Observable<Flashcard[]> {
    const url = `${this.apiUrl}/${deckId}/random?count=${count}`;
    console.log('[FlashcardService] GET random flashcards', url);
    return this.http.get<Flashcard[]>(url);
  }

  updateScore(id: string, score: number): Observable<void> {
    const normalizedId = normalizeId(id);
    const url = `${this.apiUrl}/${normalizedId}/score`;
    console.log('[FlashcardService] PATCH score', url, 'score=', score);
    return this.http.patch<void>(url, score);
  }

  updateFlashcard(card: Flashcard): Observable<Flashcard> {
    const normalizedId = normalizeId(card.id);
    const normalizedCard = { ...card, id: String(normalizedId) };
    console.log('[FlashcardService] UPDATE flashcard URL:', `${this.apiUrl}/${normalizedId}`);
    console.log('[FlashcardService] UPDATE flashcard payload:', normalizedCard);
    return this.http.put<Flashcard>(`${this.apiUrl}/${normalizedId}`, normalizedCard);
  }

  deleteFlashcard(id: string): Observable<void> {
    console.log('[FlashcardService] deleteFlashcard', id);
    return this.delete(normalizeId(id));
  }

  generate(question: string): Observable<Flashcard> {
    const url = `${API_BASE_URL}/api/generate/flashcards`;
    console.log('[FlashcardService] generate flashcard', url, question);
    return this.http.post<Flashcard>(url, {
      question,
    });
  }

  reloadFromDb(): Observable<any> {
    const url = `${this.apiUrl}/seed`;
    console.log('[FlashcardService] reloadFromDb', url);
    return this.http.post(url, {});
  }
}
