/**
 * Generic JSON fetcher for SWR.
 *
 * Wraps `fetch` and parses the response as JSON. Throws on non-2xx so SWR
 * surfaces the failure via the `error` field returned from `useSWR`.
 *
 * Registered globally via `SwrProvider` (see src/components/providers/
 * swr.tsx), so hooks don't need to pass it explicitly:
 *
 *
 * Only import this directly if you need to bypass `SWRConfig` — e.g. in a
 * one-off `useSWR(key, customFetcher)` call or outside the React tree.
 *
 * @param input - URL or Request passed straight to `fetch`.
 * @param init  - Optional `fetch` init options (headers, signal, etc.).
 * @returns The parsed JSON body, typed as `TData`.
 * @throws  An `Error` whose message includes the HTTP status when the
 *          response is not OK.
 * @example
 * ```ts
 * const { data } = useSWR<Foo>('/api/foo');
 * ```
 */
export async function fetcher<TData = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<TData> {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as TData;
}
