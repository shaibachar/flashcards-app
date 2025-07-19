const host =
  typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const protocol =
  typeof window !== 'undefined' ? window.location.protocol : 'http:';

export const environment = {
  production: true,
  // In production the API runs on the host machine. Use the current
  // hostname so mobile clients can reach it when served behind a
  // reverse proxy.
  // In production the API is served behind an nginx reverse proxy at
  // `/flashcards/api` on port 5000. Using the current hostname means
  // the same build works when deployed behind a proxy without needing
  // to hardcode the host IP.
  apiBaseUrl: `${protocol}//${host}:5000/flashcards/api`,
  logLevel: 'info',
};
