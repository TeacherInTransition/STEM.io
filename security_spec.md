# Firebase Security Specification

## Data Invariants
1. **User Ownership**: A user profile document (in `/users/{userId}`) is strictly owned by the user whose UID matches `{userId}`.
2. **Role Integrity**: Users cannot modify their own `role` or `isAdmin` status after creation.
3. **Activity Accountability**: An activity record must have a `userId` that matches the authenticated user's UID.
4. **Economic Logic**: Stemios and streaks are tied to user profiles and should only be incremented through authorized activities (though in simple frontend-only apps, we enforce ownership write).

## The Dirty Dozen Payloads
1. **Identity Theft**: Attempt to create a user profile with a different user's UID.
2. **Privilege Escalation**: User tries to update their own `isAdmin` to `true`.
3. **Role Spoofing**: Student tries to change their role to `teacher`.
4. **Data Poisoning**: Injecting a 2MB string into the `name` field.
5. **Orphaned Activity**: Creating an activity record with a `userId` that doesn't match the current user.
6. **Future Dating**: Setting a `timestamp` in the future (client-side).
7. **Cross-User Read**: User A tries to read User B's activity log (if restricted).
8. **Resource Exhaustion**: Creating 10,000 activity records in a loop (partially handled by rate limits, but rules can restrict creation patterns).
9. **Field Injection**: Adding a `ghostField` to a user document.
10. **Type Mismatch**: Sending a string for the `stemios` field.
11. **ID Poisoning**: Using a 1KB string as a `userId`.
12. **Unauthorized Deletion**: Student tries to delete a curriculum unit (if they were stored in Firestore).

## Test Runner (Draft)
A `firestore.rules.test.ts` would verify these scenarios using the Firebase Emulators or unit testing library.
