import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './auth/login.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginComponent, NgIf], 
  templateUrl: './app.component.html' 
})
export class AppComponent {
  title = 'flashcards-ui';
  constructor(public auth: AuthService) {}
}
