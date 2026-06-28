# Fix useAudio async race + slim SW precache

**Date:** 2026-06-28
**Status:** Design — pending user review (revision 2)

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
- P1 mechanism: **module-level generation token** (paired with a module-level
  `NoSleep` instance — see "Scope" decision below).
- P2 strategy: **shell-only precache + runtime cache for MP3**.

Code review findings on revision 1 (addressed in this revision):

- The SW source of truth is `scripts/generate-service-worker.mjs`, which is
  re-run by `prebuild` and `postbuild` (see `package.json:10,13`). Editing
  `public/sw.js` alone is overwritten by the next build.
- Generation token + `noSleepRef` cannot live at different scopes; the
  cancellation must be able to reach the actual NoSleep object.
- The verification grep `grep -c '\.mp3' out/sw.js` can match the runtime
  cache matcher (line 175), so it does not prove precache was slimmed.

### Scope decision (P1)

NoSleep state moves **fully to module scope**: the import promise cache, the
generation token, and the `NoSleep` instance itself all live outside the hook.
This makes the model consistent — a `disableNoSleep()` from any hook instance
can both bump the token (to cancel in-flight `enable`s) and call `disable()`
on the single shared instance.

Implications:

- Multiple `useAudio` consumers (currently `WorkoutTab` and `PeriodicTab`,
  possibly more in the future) share one `NoSleep` instance.
- The hook keeps an unmount-cleanup `useEffect` that calls
  `disableNoSleepModule()`. This is required because `page.tsx` mounts tabs
  conditionally on the active mode (lines 110, 119): switching modes
  unmounts one tab and mounts the other without triggering `beforeunload`,
  so without this cleanup a tab that enabled NoSleep would leave it on for
  the rest of the page session.
- A `beforeunload` listener is also registered by each mounted hook as a
  page-close fallback. Listeners are removable on unmount, and
  `disableNoSleepModule()` is idempotent, so the multiple-registration is
  harmless.
- `useRef` for `noSleepRef` is removed from the hook body.

## P1 design — module-level NoSleep + generation token

### Shape (module scope)

```ts
// top of useAudio.ts, replacing the current noSleepImportPromise + hook-local noSleepRef
const noSleepModule: {
  importPromise: Promise<typeof import('nosleep.js').default> | null;
  instance: NoSleepLike | null;
  generation: number;
} = {
  importPromise: null,
  instance: null,
  generation: 0,
};

const loadNoSleep = () => {
  if (!noSleepModule.importPromise) {
    noSleepModule.importPromise = import('nosleep.js').then(
      (mod) => mod.default,
    );
  }
  return noSleepModule.importPromise;
};

const enableNoSleepModule = async () => {
  if (typeof window === 'undefined') return;
  const myGen = ++noSleepModule.generation;
  if (!noSleepModule.instance) {
    try {
      const Ctor = await loadNoSleep();
      if (myGen !== noSleepModule.generation) {
        // A disable arrived during import — abort before creating the
        // NoSleep instance so we don't leak one.
        return;
      }
      noSleepModule.instance = new Ctor();
    } catch {
      return;
    }
  }
  if (myGen !== noSleepModule.generation) return;
  try {
    await noSleepModule.instance.enable();
    // Post-await token check: a disable() that arrived while enable() was
    // in flight already disabled the underlying media, but a defensive
    // disable here covers any race where the disable was synchronous and
    // completed before enable() actually started toggling media state.
    if (myGen !== noSleepModule.generation) {
      try {
        noSleepModule.instance.disable();
      } catch {}
    }
  } catch {}
};

const disableNoSleepModule = () => {
  noSleepModule.generation++;
  if (noSleepModule.instance) {
    try {
      noSleepModule.instance.disable();
    } catch {}
  }
};
```

### Hook shape

```ts
const enableNoSleep = useCallback(() => enableNoSleepModule(), []);
const disableNoSleep = useCallback(() => disableNoSleepModule(), []);
```

- Signatures are unchanged from the caller's perspective (`enableNoSleep`
  still returns a Promise; `disableNoSleep` is synchronous).
- No hook-local state for NoSleep.

### Unmount teardown

`page.tsx` (lines 110, 119) conditionally mounts `WorkoutTab` and
`PeriodicTab` based on the active mode. Switching modes unmounts one tab and
mounts the other without triggering `beforeunload`, so a tab that enabled
NoSleep could leave it on for the rest of the page session if no other
cleanup path ran. Therefore the hook must keep an unmount cleanup that calls
`disableNoSleepModule()`:

```ts
useEffect(() => {
  return () => {
    disableNoSleepModule();
  };
}, []);
```

The existing `useEffect` in `useAudio` that constructs `noSleepRef.current`
on mount and the `noSleepRef` declaration itself are removed. Cleanup no
longer touches a hook-local ref — it calls the module-level disable.

### Page-close teardown

In addition to unmount cleanup, register a `beforeunload` listener once per
page lifetime so that fully closing the tab also disables NoSleep. Because
each `useAudio` instance registers its own listener on mount, the listener
count is bounded by the number of mounted hooks (small in practice — one
tab at a time). Listeners are removable on unmount, and `disableNoSleepModule`
is idempotent, so the redundant registration is harmless.

```ts
useEffect(() => {
  const onBeforeUnload = () => disableNoSleepModule();
  window.addEventListener('beforeunload', onBeforeUnload);
  return () => window.removeEventListener('beforeunload', onBeforeUnload);
}, []);
```

### Why this works

- `disableNoSleep` synchronously bumps `noSleepModule.generation` and, if an
  instance exists, calls `.disable()` on it. Both actions operate on the
  shared module-level state, so any caller — any hook instance — can cancel
  any in-flight or completed enable.
- The generation check after each `await` catches:
  1. A disable that arrived during `loadNoSleep()` (creation aborted, no
     `NoSleep` instance leaked).
  2. A disable that arrived between instance construction and the
     `enable()` call (caller's intent is honored: no enable).
- The post-`enable()` generation check is a defensive rollback: if a disable
  arrived during `await instance.enable()`, `disable()` already ran
  synchronously and is the primary fix. The rollback covers the narrow race
  where `disable()` and `enable()` were scheduled close enough that the
  await resolves after disable but the underlying media state is left
  enabled.
- Unmount cleanup ensures switching between `WorkoutTab` and `PeriodicTab`
  (no `beforeunload` in that flow) still disables NoSleep.
- No two `useAudio` consumers can race against each other's `NoSleep`
  objects — there is only one.

### Test additions

New unit test file `src/hooks/useAudio.test.ts` (useAudio currently has no
isolated test file; WorkoutTab tests cover it indirectly).

1. **Race: disable during import resolves to nothing enabled.**
   - Mock `nosleep.js` so `import('nosleep.js').then(...)` returns a promise
     controlled by the test.
   - Call `enableNoSleep()` without awaiting.
   - Call `disableNoSleep()` immediately.
   - Resolve the import promise.
   - Flush microtasks via `await act(async () => {})`.
   - Assert `mockNoSleepEnable` was **not** called.
   - Assert no `NoSleep` instance was created (module-level state intact:
     `noSleepModule.instance === null`).
2. **Happy path: enable → disable.**
   - Same setup, but no `disableNoSleep()` between.
   - Assert `mockNoSleepEnable` was called once.
   - Call `disableNoSleep()`, assert `mockNoSleepDisable` was called once.
3. **Cross-instance: one consumer's disable cancels another's in-flight.**
   - Mount two `useAudio` consumers in a test (or invoke
     `enableNoSleepModule` twice from two hook contexts).
   - Trigger enable on consumer A; before resolve, trigger disable on
     consumer B.
   - Resolve.
   - Assert `mockNoSleepEnable` was not called on the shared instance
     (consumer A's create-and-enable was discarded).
4. **Unmount cleanup: switching modes disables NoSleep.**
   - Enable NoSleep in a test consumer.
   - Unmount the consumer.
   - Assert `mockNoSleepDisable` was called once.
   - Mount a second consumer in the same test session — it should reuse
     the existing `NoSleep` instance (state is module-level).

The existing 17 WorkoutTab tests must continue to pass without modification
because the externally observable behavior of the hook is unchanged.

## P2 design — shell-only precache

### Source of truth

`public/sw.js` is **generated** by `scripts/generate-service-worker.mjs` (see
`package.json:10,13` — `prebuild` runs it before `next build`, `postbuild`
re-runs it with `--out` to also generate `out/sw.js`). The generator is
the only place where the precache list is constructed; both `public/sw.js`
and `out/sw.js` are overwritten on every build.

### Change to the generator

Edit `scripts/generate-service-worker.mjs:74-93` (`getPublicPrecacheUrls`)
to drop the audio-walking loop:

```js
const getPublicPrecacheUrls = () => {
  const urls = new Set([
    `${BASE_PATH}/`,
    `${BASE_PATH}/disclaimer`,
    `${BASE_PATH}/favicon.ico`,
    `${BASE_PATH}/icon.svg`,
    `${BASE_PATH}/icon-192.png`,
    `${BASE_PATH}/icon-512.png`,
    `${BASE_PATH}/manifest.webmanifest`,
  ]);
  return [...urls].sort();
};
```

`getOutPrecacheUrls` (line 95) is also affected because the SW generated for
`out/sw.js` is used at runtime — but `out/` contains no `.mp3` (only
`audio/built-in-plans/yunxi/audit.json` and `.md`, which the existing
`audioDir` audit exclusion already filters). The current static-extension
allowlist (line 100) does not include `.mp3`, so `getOutPrecacheUrls`
already produces zero MP3 entries. No change needed there.

The generator's MP3 file-walking loop in `getCacheVersion` (lines 60-65) is
kept — cache-version hashing still benefits from audio file stamps so a
content change to an audio file bumps the cache version even though the
audio itself is no longer precached. (Trivial; could be removed later if
desired, but it's not on the critical path.)

### Runtime cache

`isCacheableAsset` (generated line 175) keeps matching `.mp3` so that audio
fetches are routed through `cacheFirst`, which populates `RUNTIME_CACHE` on
first miss. This is what enables offline playback after the user has heard
an MP3 once.

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
2. `npm run build` succeeds. Generated `public/sw.js` and `out/sw.js` contain
   only the seven shell URLs in `PRECACHE_URLS` and no MP3 entries.
3. **Precache-emptiness assertion** — extract the `PRECACHE_URLS` literal
   from the generated SW and confirm it contains zero `.mp3` entries:
   ```sh
   node -e '
     const sw = require("fs").readFileSync("out/sw.js","utf8");
     const m = sw.match(/const PRECACHE_URLS = (\[[^\]]+\])/);
     if (!m) { console.error("PRECACHE_URLS not found"); process.exit(1); }
     const urls = JSON.parse(m[1]);
     const mp3 = urls.filter(u => u.endsWith(".mp3"));
     console.log("PRECACHE_URLS count:", urls.length, "MP3 entries:", mp3.length);
     if (mp3.length !== 0) process.exit(1);
   '
   ```
   The runtime cache matcher (`isCacheableAsset`) is allowed to still match
   `.mp3`; this assertion only inspects `PRECACHE_URLS`.
4. Manual smoke (Chrome DevTools, Application → Service Workers, Offline):
   - Fresh install: no MP3 network requests until a step is played.
   - After listening to step A, going Offline and reloading: step A still
     plays.
5. Manual smoke on iOS Safari:
   - Tap a step, start the workout, screen stays awake (verifies the P1 fix
     did not regress the happy path).
   - Start → pause within ~100ms (faster than the nosleep import) —
     confirm screen is allowed to sleep again (generation token honored).
   - Start a workout, switch to periodic mode, leave the page open — the
     screen should sleep after the device's idle timeout (unmount cleanup
     disabled NoSleep).

## Files touched

- `src/hooks/useAudio.ts` — replace hook-local NoSleep state with module-level
  `noSleepModule`, update `enableNoSleep` / `disableNoSleep`, add
  `beforeunload` teardown, remove the obsolete `useEffect` that creates the
  instance.
- `scripts/generate-service-worker.mjs` — drop the audio-walking loop in
  `getPublicPrecacheUrls`.
- `public/sw.js` — regenerated by the script (do not hand-edit; commit the
  regenerated output).
- `out/sw.js` — regenerated by the script; not git-tracked, no commit
  needed.
- `src/hooks/useAudio.test.ts` — new file with race-condition unit tests.

## Rollback

- **P1**: revert `src/hooks/useAudio.ts`. The race condition (NoSleep stuck
  on after a fast pause) reappears; no data is lost.
- **P2**: revert `scripts/generate-service-worker.mjs` and regenerate. The
  17MB install precache returns. No data is lost.
