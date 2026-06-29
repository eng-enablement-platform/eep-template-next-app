import { registerOTel } from '@vercel/otel';

/**
 * Next.js instrumentation hook — called once before the app starts in each
 * runtime environment (Node.js and Edge). Registers the OpenTelemetry SDK so
 * all built-in Next.js spans (request handling, rendering, fetch calls, route
 * handlers) are emitted automatically.
 *
 * Telemetry is only exported when `OTEL_EXPORTER_OTLP_ENDPOINT` is set. When
 * the variable is absent (e.g. CI, local dev without a collector) the SDK
 * initialises but no data is sent, so there is no runtime cost.
 *
 * @see https://nextjs.org/docs/app/guides/open-telemetry
 */
export function register() {
  registerOTel({ serviceName: 'next-template' });
}
