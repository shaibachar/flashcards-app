import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Deck } from '../models/deck';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  decks: Deck[] = [
    { id: 'csharp', name: 'C# Basics', description: 'Value types, delegates, structs, etc.' },
    { id: 'dotnet', name: '.NET Framework', description: 'Runtime, GC, etc.' }
  ];

  constructor(private router: Router) {}

  selectDeck(deck: Deck) {
    this.router.navigate(['/deck', deck.id]);
  }
}
