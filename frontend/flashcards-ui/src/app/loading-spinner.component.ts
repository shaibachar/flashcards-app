import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [NgIf],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {
  loading$ = this.loading.loading$;
  constructor(private loading: LoadingService) {}
}
