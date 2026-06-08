/**
 * Interactive API reference for the data API, rendered with Swagger UI.
 *
 * Serves a small self-contained HTML page that loads Swagger UI's prebuilt
 * assets (from `/swagger-ui/...`, copied out of the `swagger-ui-dist` package
 * into `public/` by `scripts/copy-swagger-ui.ts` — no third-party CDN) and
 * points it at the OpenAPI spec at `/api/openapi`. Visit `/api-docs` in the
 * browser.
 *
 * Swagger UI keeps the live "Try it out" console, so every method can be
 * exercised against the running app (and seeded data) from the page. The spec
 * itself is unchanged — only the renderer differs, so swapping renderers later
 * is cheap.
 *
 * `url` is relative, so it resolves against whatever origin serves the page
 * (localhost in dev, your deployed domain in prod) with no env config.
 */

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Example Items API Reference</title>
    <link rel="stylesheet" href="/swagger-ui/swagger-ui.css" />
    <style>
      body { margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/swagger-ui/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api/openapi',
        dom_id: '#swagger-ui',
        deepLinking: true,
      });
    </script>
  </body>
</html>
`;

/**
 * Render the Swagger UI documentation page.
 *
 * @returns 200 with the HTML shell that boots Swagger UI.
 */
export function GET(): Response {
  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}
