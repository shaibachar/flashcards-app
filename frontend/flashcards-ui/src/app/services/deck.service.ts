import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Deck } from '../models/deck';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

const API_BASE_URL = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class DeckService {
  private apiUrl = `${API_BASE_URL}/decks`;

  constructor(private http: HttpClient) {}

  getDecks(): Observable<Deck[]> {
    return this.http.get<Deck[]>(this.apiUrl);
  }

  refreshCoverage(deckId: string): Observable<number> {
    return this.http
      .post<{ coverage: number }>(`${this.apiUrl}/${deckId}/coverage`, {})
      .pipe(map(res => res.coverage));
  }

  updateDeck(oldId: string, deck: Deck): Observable<Deck> {
    return this.http.put<Deck>(`${this.apiUrl}/${oldId}`, deck);
  }
}
