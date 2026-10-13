/** Hosts that mean "a Postgres on this machine" - usually this project's docker compose. */
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

const SWITCH_PORT_ADVICE =
  "Either stop that project's database (e.g. `pnpm db:down` or `docker compose down` in its folder), or run this project's database on a free port: set POSTGRES_PORT=5433 in .env.local, then run `pnpm db:up`.";

/*
 * Collects error codes from an error, its `cause` chain and any AggregateError
 * members. Drizzle wraps the driver error as `cause`, and Node reports a
 * refused connection as an AggregateError (one attempt per IPv4/IPv6 address).
 */
const collectCodes = (error: unknown, depth = 0): string[] => {
  if (!(error instanceof Error) || depth > 5) {
    return [];
  }
  const own =
    'code' in error && typeof error.code === 'string' ? [error.code] : [];
  const members =
    error instanceof AggregateError
      ? error.errors.flatMap((member: unknown) =>
          collectCodes(member, depth + 1),
        )
      : [];
  return [...own, ...members, ...collectCodes(error.cause, depth + 1)];
};

/**
 * Turns the common "can't use the database" failures into plain advice.
 *
 * The usual cause locally is a port clash: another project's Postgres is on
 * the port DATABASE_URL points at, so we reach the wrong database. Postgres
 * then says the database doesn't exist (`3D000`) or rejects the password
 * (`28P01`). A refused connection means nothing is running on that port.
 *
 * @param error - The error thrown while connecting or querying.
 * @param databaseUrl - The `DATABASE_URL` that was used.
 * @returns A human-readable explanation with next steps, or `undefined` when
 *   the error isn't one of the recognised connection problems.
 *
 * @example
 * ```ts
 * describeDatabaseConnectionError(error, process.env.DATABASE_URL);
 * // 'Connected to Postgres on localhost:5432, but it has no "app" database. ...'
 * ```
 */
export function describeDatabaseConnectionError(
  error: unknown,
  databaseUrl: string | undefined,
): string | undefined {
  let host = 'the database host';
  let port = '5432';
  let database = 'app';
  try {
    const url = new URL(databaseUrl ?? '');
    host = url.hostname;
    port = url.port || '5432';
    database = decodeURIComponent(url.pathname.replace(/^\//, '')) || database;
  } catch {
    // An unparseable URL is reported by env validation; keep the defaults.
  }
  const where = `${host}:${port}`;
  const isLocal = LOCAL_HOSTS.has(host);
  const codes = collectCodes(error);

  if (codes.includes('3D000')) {
    return isLocal
      ? `Connected to Postgres on ${where}, but it has no "${database}" database. Is that another project's Postgres? ${SWITCH_PORT_ADVICE}`
      : `Connected to Postgres on ${where}, but it has no "${database}" database. Check the database name in DATABASE_URL.`;
  }

  if (codes.includes('28P01')) {
    return isLocal
      ? `Connected to Postgres on ${where}, but the login was rejected (password authentication failed). Is that another project's Postgres? ${SWITCH_PORT_ADVICE}`
      : `Connected to Postgres on ${where}, but the login was rejected. Check the username and password in DATABASE_URL.`;
  }

  if (codes.includes('ECONNREFUSED')) {
    return isLocal
      ? `Nothing is accepting connections on ${where}. Start this project's database with \`pnpm db:up\` (it uses POSTGRES_PORT from .env.local), then try again.`
      : `Nothing is accepting connections on ${where}. Check the host and port in DATABASE_URL, and that the database is running.`;
  }

  return undefined;
}

/**
 * Error handler for the standalone database scripts (migrate, seed, smoke
 * check): prints plain advice for recognised connection problems, otherwise
 * the full error, then exits non-zero.
 *
 * @param label - What failed, e.g. `'DB migrations failed'`.
 * @returns A `catch` handler.
 *
 * @example
 * ```ts
 * runMigrations().catch(handleScriptError('DB migrations failed'));
 * ```
 */
export function handleScriptError(label: string): (error: unknown) => never {
  return (error) => {
    const advice = describeDatabaseConnectionError(
      error,
      process.env.DATABASE_URL,
    );
    console.error(advice === undefined ? `${label}:` : `${label}: ${advice}`);
    if (advice === undefined) {
      console.error(error);
    }
    process.exit(1);
  };
}
