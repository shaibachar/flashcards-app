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
  // `/flashcards/api`. Requests should go to the same host and port
  // that served the frontend, so the port is omitted.
  apiBaseUrl: `${protocol}//${host}/flashcards/api`,
  logLevel: 'info',
};
