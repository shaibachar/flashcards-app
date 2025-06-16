import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : `http://${window.location.hostname}:5000`;

@Injectable({ providedIn: 'root' })
export class FlashcardQueryService {
    

  constructor(private http: HttpClient) {}

  queryString(query: string): Observable<any> {
    return this.http.post<any>(`${API_BASE_URL}/Flashcards/query-string`, { query });
  }
}
