import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslatePipe } from '../services/translate.pipe';
import { TranslationService } from '../services/translation.service';
import { DeckService } from '../services/deck.service';
import { Subject, filter, takeUntil } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit, OnDestroy {
  menuOpen = false;
  currentDeckLabel = 'Flashcards';
  private destroy$ = new Subject<void>();
  private deckNames = new Map<string, string>();
  private decksLoaded = false;

  constructor(
    public auth: AuthService,
    private router: Router,
    public i18n: TranslationService,
    private deckService: DeckService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadDeckNames();
    this.syncDeckLabel();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe(() => this.syncDeckLabel());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get userAvatarUrl(): string {
    return 'assets/icons/user-avatar.png';
  }

  onUserIconClick() {
    if (this.auth.getCurrentUser()) {
      this.router.navigate(['/settings']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
    this.closeMenu();
  }

  toggleLang() {
    this.i18n.toggle();
  }

  private loadDeckNames() {
    if (this.decksLoaded) {
      return;
    }
    this.decksLoaded = true;
    this.deckService.getDecks().subscribe({
      next: decks => {
        decks.forEach(deck => this.deckNames.set(deck.id, deck.name || deck.id));
        this.syncDeckLabel();
      },
      error: () => {
        this.decksLoaded = false;
      }
    });
  }

  private syncDeckLabel() {
    this.loadDeckNames();
    const deckId = this.extractDeckId();
    if (!deckId) {
      this.currentDeckLabel = 'Flashcards';
      return;
    }
    const label = this.resolveDeckLabel(deckId);
    this.currentDeckLabel = label || 'Flashcards';
  }

  private extractDeckId(): string | null {
    let currentRoute: ActivatedRoute | null = this.route;
    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    return currentRoute?.snapshot.paramMap.get('deckId') ?? null;
  }

  private resolveDeckLabel(deckId: string): string {
    if (this.deckNames.has(deckId)) {
      return this.deckNames.get(deckId)!;
    }

    if (deckId.startsWith('temp-')) {
      const stored = sessionStorage.getItem(deckId);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.name) {
            return parsed.name;
          }
        } catch {
          // ignore parse error, fallback below
        }
      }
    }

    return deckId;
  }
}
