import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Deck } from '../models/deck';
import { CommonModule } from '@angular/common';
import { DeckService } from '../services/deck.service';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,MenuComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  decks: Deck[] = [];

  constructor(private router: Router, private deckService: DeckService) { }


  ngOnInit(): void {
    this.deckService.getDecks().subscribe({
      next: (data) => this.decks = data,
      error: (err) => console.error('Failed to load decks:', err)
    });
  }

  selectDeck(deck: Deck) {
    console.log("select deck"+deck.id);
    this.router.navigate(['/deck', deck.id]);
  }
}