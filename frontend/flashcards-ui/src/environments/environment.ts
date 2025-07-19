const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';

export const environment = {
  production: false,
  // Use the current hostname so mobile devices on the same network can reach
  // the backend when running the app with `ng serve --host 0.0.0.0`.
  // Falls back to localhost for server-side rendering.
  // The API is served behind an nginx reverse proxy under the
  // `/flashcards/api` base path on port 5000. Using the current
  // hostname ensures mobile devices on the network can reach it
  // when running `ng serve --host 0.0.0.0`.
  apiBaseUrl: `${protocol}//${host}:5000/flashcards/api`,
  logLevel: 'debug'
};
