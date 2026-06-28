# Fix useAudio async race + slim SW precache

**Date:** 2026-06-28
**Status:** Design — pending user review

## Background

Two findings from a code review of the initial-load optimization (memory:
[[workout-timer-initial-load-optimization]]):

- **P1** `src/hooks/useAudio.ts:562` — `enableNoSleep()` is now async because
  `nosleep.js` is lazy-loaded. Callers use `void enableNoSleep()`, so the
  in-flight promise survives across user actions. If the user pauses, resets,
  or unmounts before `loadNoSleep()` resolves, `disableNoSleep()` is a no-op
  (`noSleepRef.current === null`), then the resolved promise still creates a
  `NoSleep` instance and calls `.enable()`, leaving the screen awake
  indefinitely.

- **P2** `public/sw.js:5` — `PRECACHE_URLS` enumerates 637 MP3 files (~17MB).
  The browser fetches them all in the SW `install` step, competing with the
  first-paint critical resources on slow mobile networks.

User decisions (brainstorming session 2026-06-28):

- Both fixes in one implementation cycle.
- P1 mechanism: **generation token** (module-level counter).
- P2 strategy: **shell-only precache + runtime cache for MP3**.

## P1 design — generation token

### Shape

Module-level counter (single source of truth across hook instances):

```ts
// outside the hook, near noSleepImportPromise
const noSleepGenerationRef = { value: 0 };
```

Hook body:

```ts
const enableNoSleep = useCallback(async () => {
  if (typeof window === 'undefined') return;
  const myToken = ++noSleepGenerationRef.value;
  if (!noSleepRef.current) {
    try {
      const Ctor = await loadNoSleep();
      if (myToken !== noSleepGenerationRef.value) {
        // a disable arrived during import — discard
        return;
      }
      noSleepRef.current = new Ctor();
    } catch {
      return;
    }
  }
  if (myToken !== noSleepGenerationRef.value) return;
  try {
    await noSleepRef.current.enable();
  } catch {}
}, []);

const disableNoSleep = useCallback(() => {
  noSleepGenerationRef.value++;
  if (noSleepRef.current) {
    try {
      noSleepRef.current.disable();
    } catch {}
  }
}, []);
```

### Why this works

- `disableNoSleep` is the synchronous critical path. It bumps the token before
  it touches `noSleepRef`, so any in-flight `enable` that resumes from an
  `await` afterwards sees a stale token and bails out without calling
  `NoSleep.enable()`.
- The token lives at module scope (not in a ref), so it survives hook
  re-instantiation and works across multiple component instances of `useAudio`.
  This matters because `WorkoutTab` and `PeriodicTab` are mounted/unmounted
  independently.
- The token check happens **twice**: once after `await loadNoSleep()` (in case
  a disable arrived while we were loading the module) and once before
  `await noSleepRef.current.enable()` (in case a disable arrived while the
  previous instance was enabling).

### External behavior preserved

- The hook still returns `enableNoSleep` and `disableNoSleep` with the same
  signatures. Existing call sites (`void enableNoSleep()` / `void disableNoSleep()`)
  continue to compile and behave correctly.
- NoSleep still gets enabled in the happy path. The only change is that a
  pause/reset/unmount between the start of `enableNoSleep` and its completion
  is now respected.

### Test additions

New unit test in `src/hooks/useAudio.test.ts` (new file — useAudio currently
has no isolated test file; WorkoutTab tests cover the hook indirectly):

1. **Race: disable during import resolves to nothing enabled.**
   - Mock `nosleep.js` so `import('nosleep.js').then(...)` returns a promise
     controlled by the test.
   - Call `enableNoSleep()` without awaiting.
   - Call `disableNoSleep()` immediately.
   - Now resolve the import promise.
   - Flush microtasks via `await act(async () => {})`.
   - Assert `mockNoSleepEnable` was **not** called.
2. **Happy path: enable → disable.**
   - Same setup, but no `disableNoSleep()` between.
   - Assert `mockNoSleepEnable` was called once.
   - Call `disableNoSleep()`, assert `mockNoSleepDisable` was called once.

The existing 17 WorkoutTab tests must continue to pass without modification
because the externally observable behavior of the hook is unchanged.

## P2 design — shell-only precache

### Change

Replace `PRECACHE_URLS` in `public/sw.js` with `SHELL_URLS` containing only
non-MP3 resources:

```js
const SHELL_URLS = [
  '/workout-timer/',
  '/workout-timer/disclaimer',
  '/workout-timer/favicon.ico',
  '/workout-timer/icon-192.png',
  '/workout-timer/icon-512.png',
  '/workout-timer/icon.svg',
  '/workout-timer/manifest.webmanifest',
];
```

The `install` handler, `cacheFirst` strategy, and `isCacheableAsset` matcher
remain unchanged — `cacheFirst` already populates the runtime cache on first
miss, so MP3s are fetched lazily on first play.

### Expected impact

- Install precache payload drops from ~17MB to ~20KB.
- First MP3 played after a fresh install requires a network round-trip
  (hundreds of ms on weak networks, accepted as the cost of not preloading).
- Repeat plays within the same session and revisits within the cache lifetime
  are served from `RUNTIME_CACHE`.
- Offline behavior: users can still browse the page, the timer works, and any
  MP3 they previously listened to still plays.

### Out of scope

- Prefetching the active plan's MP3s when the user selects a plan. Could be
  added later via `WorkoutTab.tsx` calling `cache.add(url)` on plan load, but
  the current ask does not require it.
- Changing the `cacheFirst` strategy itself. It already does the right thing
  for runtime caching.

## Verification

1. `npm run test -- --run` — all 133 existing tests + new race tests pass.
2. `npm run build` succeeds; `grep -c '\.mp3' out/sw.js` returns `0`.
3. Manual smoke (Chrome DevTools, Application → Service Workers, Offline):
   - Fresh install: no MP3 network requests until a step is played.
   - After listening to step A, going Offline and reloading: step A still
     plays.
4. Manual smoke on iOS Safari: tap a step, start the workout, screen stays
   awake (verifies the P1 fix did not regress the happy path).

## Files touched

- `src/hooks/useAudio.ts` — add `noSleepGenerationRef`, two token checks in
  `enableNoSleep`, token bump in `disableNoSleep`.
- `public/sw.js` — rename `PRECACHE_URLS` → `SHELL_URLS`, remove all MP3
  entries.
- `src/hooks/useAudio.test.ts` — new file with race-condition unit tests.

## Rollback

- **P1**: revert `src/hooks/useAudio.ts`. The race condition (NoSleep stuck
  on after a fast pause) reappears; no data is lost.
- **P2**: revert `public/sw.js`. The 17MB install precache returns. No data
  is lost.
