import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Deck } from '../models/deck';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const API_BASE_URL = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class DeckService {
  private apiUrl = `${API_BASE_URL}/decks`;

  constructor(private http: HttpClient) {}

  getDecks(): Observable<Deck[]> {
    console.log('[DeckService] GET', this.apiUrl);
    return this.http.get<Deck[]>(this.apiUrl);
  }
}
