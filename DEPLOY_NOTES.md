# What changed & how to deploy it

## Files in this drop
- `functions/src/index.ts` — the Cloud Function
- `functions/package.json`, `functions/tsconfig.json` — its build config
- `firestore.rules` — replaces your current rules file
- `firebase.ts` — replaces `src/lib/firebase.ts`

## Required: Blaze plan
Cloud Functions for Firebase (even simple background triggers like this one)
require the **Blaze pay-as-you-go plan**. Spark (free) won't deploy this.
Actual cost here will be near-zero at this app's scale — you're billed per
invocation and per Firestore op, and this triggers once per unit completion.

## Integration steps
1. Drop the `functions/` folder into your project root (next to
   `firestore.rules`, `package.json`, etc.) — same layout `firebase init
   functions` would produce.
2. Replace your root `firestore.rules` with the one in this drop.
3. Replace `src/lib/firebase.ts` with `firebase.ts` from this drop (same
   file, just the `logActivity` internals changed — nothing importing it
   needs to change).
4. If you don't already have a `firebase.json`, it needs a `functions` block
   pointing at this folder, e.g.:
   ```json
   {
     "functions": [{ "source": "functions", "codebase": "default" }],
     "firestore": { "rules": "firestore.rules" }
   }
   ```
   If you already have one, just make sure the `functions.source` path
   matches wherever you put the `functions/` folder.
5. Install and build:
   ```
   cd functions && npm install && npm run build
   ```
6. Deploy both together so they land atomically:
   ```
   firebase deploy --only functions,firestore:rules
   ```

## One-time backfill needed
Any existing user documents in Firestore need `stemios` and `streak` fields
present as numbers (the new `isValidUser` schema check requires exactly
6 keys). If every existing account already has both fields (which
`useUser.ts` sets on creation), you're fine — nothing to backfill.

## Behavior change to expect
Stemios/streak updates are no longer instant-on-write from the client — they
show up after the Cloud Function trigger fires (typically well under a
second, but not synchronous like the old direct `updateDoc` was). Your
`onSnapshot` listener on the user doc already handles this correctly with no
UI change needed; just don't be alarmed if a manual Firestore console test
doesn't update `stemios` immediately on `activities` doc creation — check the
Cloud Functions logs (`firebase functions:log` or the console) to confirm the
trigger ran.

## What this does NOT fix yet
- OAuth scope over-permissioning (audit item #5) — untouched in this patch.
- Hardcoded admin email in `useUser.ts` (item #6) — untouched.
- Inline base64 images in lesson docs (item #7) — untouched.
- No auth/rate-limit on `/api/gemini/generate` (item #8) — untouched.
- The "haha" guest-admin backdoor and missing HTML sanitization in
  `LessonViewer` — untouched. Worth doing next; it's the actual XSS path.
