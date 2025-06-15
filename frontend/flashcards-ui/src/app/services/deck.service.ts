import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Deck } from '../models/deck';
import { Observable } from 'rxjs';

const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'http://backend:80';

@Injectable({ providedIn: 'root' })
export class DeckService {
  private apiUrl = `${API_BASE_URL}/decks`;

  constructor(private http: HttpClient) {}

  getDecks(): Observable<Deck[]> {
    return this.http.get<Deck[]>(this.apiUrl);
  }
}
