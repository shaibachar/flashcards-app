import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Deck } from '../models/deck';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeckService {
  private apiUrl = 'http://localhost:5000/decks';

  constructor(private http: HttpClient) {}

  getDecks(): Observable<Deck[]> {
    return this.http.get<Deck[]>(this.apiUrl);
  }
}
