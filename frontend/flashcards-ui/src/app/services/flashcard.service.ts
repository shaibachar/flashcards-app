import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Flashcard } from '../models/flashcard';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FlashcardService {
  private apiUrl = 'http://localhost:5000/flashcards';

  constructor(private http: HttpClient) {}

  getRandom(count = 10): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(`${this.apiUrl}/random?count=${count}`);
  }

  updateScore(id: string, score: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/score`, score);
  }
}
