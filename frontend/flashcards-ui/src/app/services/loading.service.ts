import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private count = 0;
  private loadingSubject = new BehaviorSubject(false);
  loading$ = this.loadingSubject.asObservable();

  show() {
    this.count++;
    if (this.count === 1) {
      this.loadingSubject.next(true);
    }
  }

  hide() {
    if (this.count > 0) {
      this.count--;
      if (this.count === 0) {
        this.loadingSubject.next(false);
      }
    }
  }
}
