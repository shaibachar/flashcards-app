import { ServerRoute, RenderMode } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'deck/:deckId',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: () =>
      Promise.resolve([
        { deckId: 'csharp' },
        { deckId: 'dotnet' }
      ])
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
