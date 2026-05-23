## Getting Started

First, run the development server:

```bash
pnpm dev
```

## Troubleshooting

### Symptom: `next-server` pegs CPU during `pnpm dev` or `pnpm e2e`, and `kernel_task` climbs above 100%

This bit us hard once — capturing the postmortem so it doesn't bite again.

**What's actually happening.** macOS `kernel_task` high CPU is not real work. It's the kernel's thermal throttle — once the silicon gets hot, the kernel schedules fake load to force userland processes to slow down so the chip can cool. The throttle **persists for tens of seconds to minutes after the actual load is gone**, which is what makes a 20-second cold-compile spike look like a permanent problem.

So the diagnostic order matters: figure out what got the CPU hot first; don't chase `kernel_task`.

**Root causes we hit (and the fixes that stuck):**

| Cause                                                                                                                                                    | Fix                                                                                                   | Why it mattered                                                                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Three `next/font/google` imports in `src/app/layout.tsx` (`Inter`, `Geist`, `Geist_Mono`) — two were loaded but never referenced by any Tailwind utility | Reduced to one (`Inter`), removed the dead `--font-mono` / `--font-heading` tokens from `globals.css` | Each font is fetched + subsetted on cold compile. CPU cost scales linearly with font count. Two of three were pure dead weight.                                                                                     |
| Playwright `workers: undefined` defaulting to `os.cpus().length / 2` (so 4 on an 8-core laptop)                                                          | `workers: 1`, `fullyParallel: false` in `e2e-tests/playwright.config.ts`                              | 4 parallel Chromium workers all hitting `next dev` cold at the same time = thundering-herd compile. Singlefile the requests until the suite is big enough that wall-clock actually hurts.                           |
| `shadcn` in runtime `dependencies`                                                                                                                       | Moved to `devDependencies`                                                                            | It's the CLI for scaffolding components, not a runtime lib. Pulls ~200 transitive packages (Babel, MSW, MCP SDK, ts-morph) into your dep tree. Doesn't move the dev CPU needle on its own, but bloats prod deploys. |
| Default Playwright `webServer.timeout` (60s) too short while thermally throttled                                                                         | `timeout: 180_000` in `e2e-tests/playwright.config.ts`                                                | A thermally-throttled `next dev` boot can take 60s+ even though it normally completes in <1s. Default timeout fires before the server can come up.                                                                  |

**Diagnostic checklist (run in this order):**

1. **Watch Activity Monitor.** Distinguish `next-server` CPU (real work) from `kernel_task` CPU (throttle). High `kernel_task` means cool the laptop down before doing anything else — it has a long recovery curve and you'll be debugging a ghost.
2. **Check for orphan processes** from prior killed runs:

   ```bash
   lsof -i :3000
   ps -axo pid,pcpu,etime,command | grep -E 'next-server|next dev' | grep -v grep
   ```

3. **Isolate `next dev` from Playwright** to confirm where the spike is:

   ```bash
   rm -rf .next
   pnpm dev          # watch for "✓ Ready in XXXms" — boot is fine
   curl http://localhost:3000   # spike happens here, at "○ Compiling /"
   ```

   If boot is sub-second and the spike is on first request, you're paying cold-compile cost — look at `layout.tsx` imports first (fonts especially), then page-level imports.

4. **`Error: Process from config.webServer exited early` is not a bug** — it's always caused by something killing the parent Playwright process (Ctrl-C, exit code 130 = SIGINT) while the webServer was still spinning up. The webServer didn't crash; its parent was killed. Either wait it out, or bump `webServer.timeout`.

5. **Wipe `.next/` to rule out stale Turbopack state**: `rm -rf .next`. Killed compiles can leave half-written artifacts that slow the next boot.

6. **Don't Ctrl-C reflexively.** Letting one run complete (even a slow one) gives you a baseline. Killing every run turns a 20-second spike into a 25-minute thermal cascade and leaks processes.

**How to iterate without paying the cold-compile tax every run:** leave `pnpm dev` running in one terminal all day. Playwright's `reuseExistingServer: !process.env.CI` will latch onto it instead of spawning a fresh dev server every test invocation:

```bash
# Terminal 1 — leave running
pnpm dev

# Terminal 2 — iterate freely against the warm server
pnpm e2e
pnpm e2e:ui
```

## TODOS

- Playwright
- AGENTS.md + GSD setup
- Docs site + README Structure
- Drizzle + Postgres (local docker & Neon)
- Docker
- Dev Container
- Full docs and deep dive write up on all tech and tools in `/docs`/

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
