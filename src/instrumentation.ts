import { registerOTel } from '@vercel/otel';

// Relative import: package.json sits outside src/, so the @/ alias can't reach it.
import packageJson from '../package.json';

/**
 * Next.js instrumentation hook - called once before the app starts in each
 * runtime environment (Node.js and Edge). Registers the OpenTelemetry SDK so
 * all built-in Next.js spans (request handling, rendering, fetch calls, route
 * handlers) are emitted automatically.
 *
 * The service name is the package.json `name` - create-eep sets it to the
 * project name, so each project's traces are labelled as that project.
 *
 * Telemetry is only exported when `OTEL_EXPORTER_OTLP_ENDPOINT` is set. When
 * the variable is absent (e.g. CI, local dev without a collector) the SDK
 * initialises but no data is sent, so there is no runtime cost.
 *
 * @see https://nextjs.org/docs/app/guides/open-telemetry
 */
export function register() {
  registerOTel({ serviceName: packageJson.name });
}
