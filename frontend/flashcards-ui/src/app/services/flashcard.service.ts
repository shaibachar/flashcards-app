import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Flashcard } from '../models/flashcard';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FlashcardService {
  private apiUrl = 'http://localhost:5000/flashcards';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(this.apiUrl);
  }

  generateSummaryCard(questions: string[]): Observable<Flashcard> {
    return this.http.post<Flashcard>(`${this.apiUrl}/generate-summary`, { questions });
  }

  create(card: Flashcard): Observable<Flashcard> {
    return this.http.post<Flashcard>(this.apiUrl, card);
  }

  update(card: Flashcard): Observable<Flashcard> {
    return this.http.put<Flashcard>(`${this.apiUrl}/${card.id}`, card);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getRandom(deckId: string, count = 50): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(`${this.apiUrl}/${deckId}/random?count=${count}`);
  }

  updateScore(id: string, score: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/score`, score);
  }

  updateFlashcard(card: Flashcard): Observable<Flashcard> {
    return this.http.put<Flashcard>(`${this.apiUrl}/${card.id}`, card);
  }

  deleteFlashcard(id: string): Observable<void> {
    return this.delete(id);
  }
}
