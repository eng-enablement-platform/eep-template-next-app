import { loadEnvConfig } from '@next/env';

/*
 * Side-effect module for standalone scripts (tsx) that run outside Next.js:
 * loads .env files the same way Next.js does - including ${VAR} expansion, so
 * DATABASE_URL can use ${POSTGRES_PORT}. Variables already in the environment
 * win (e.g. the devcontainer's DATABASE_URL).
 *
 * Import it FIRST, as a bare `import`: imports run before the rest of a file,
 * and `@/lib/env` validates the moment it's imported - so loading env with a
 * function call after the imports is too late.
 */
loadEnvConfig(process.cwd(), true, {
  info: () => undefined,
  error: console.error,
});
