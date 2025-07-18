import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

const API_BASE_URL = environment.apiBaseUrl;

@Injectable({ providedIn: 'root' })
export class FlashcardQueryService {
    

  constructor(private http: HttpClient) {}

  queryString(query: string): Observable<any> {
    return this.http.post<any>(`${API_BASE_URL}/Flashcards/query-string`, { query });
  }
}
