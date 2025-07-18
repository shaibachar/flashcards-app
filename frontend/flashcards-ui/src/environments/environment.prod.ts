const host =
  typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const protocol =
  typeof window !== 'undefined' ? window.location.protocol : 'http:';

export const environment = {
  production: true,
  // In production the API runs on the host machine. Use the current
  // hostname so mobile clients can reach it when served behind a
  // reverse proxy.
  apiBaseUrl: `${protocol}//${host}:5000/flashcards/api`,
  logLevel: 'info',
};
