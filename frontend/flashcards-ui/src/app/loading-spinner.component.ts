import { IonicModule } from '@ionic/angular/standalone';
import { Component } from '@angular/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [IonicModule, NgIf, AsyncPipe],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {
  loading$: Observable<boolean>;

  constructor(private loading: LoadingService) {
    this.loading$ = this.loading.loading$;
  }
}
