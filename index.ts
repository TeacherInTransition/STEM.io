import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

initializeApp();
const db = getFirestore();

/**
 * Canonical reward table — the ONLY source of truth for how many stemios a
 * unit is worth. The client's `reward` field on an activity document is
 * advisory only and is never trusted; this table is what actually pays out.
 *
 * Keep this in sync with src/curriculumData.ts and src/aiFoundationsData.ts.
 * If those files change, update this table in the same PR.
 */
const REWARD_TABLE: Record<string, number> = {
  // curriculumData.ts
  f1: 10, f2: 15,
  s1: 15, s2: 20,
  c1: 15, c2: 20,
  v1: 20, v2: 15,
  d1: 25, d2: 25,
  cp1: 20, cp2: 15,
  // aiFoundationsData.ts
  u1: 10, u2: 15, u3: 15, u4: 20,
  u5: 15, u6: 20, u7: 15, u8: 20,
  u9: 20, u10: 20, u11: 15, u12: 15,
  u13: 20, u14: 25, u15: 30, u16: 30,
  u17: 15, u18: 20, u19: 50, u20: 30,
};

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function isPreviousCalendarDay(prev: Date, curr: Date): boolean {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const prevMidnight = Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth(), prev.getUTCDate());
  const currMidnight = Date.UTC(curr.getUTCFullYear(), curr.getUTCMonth(), curr.getUTCDate());
  return currMidnight - prevMidnight === oneDayMs;
}

/**
 * Fires whenever a client writes a new document to /activities (see
 * logActivity() in src/lib/firebase.ts). This is the ONLY place stemios and
 * streak are ever incremented — the client can no longer write those fields
 * directly (see the updated firestore.rules).
 *
 * Guarantees:
 *  - reward amount always comes from REWARD_TABLE, never the client payload
 *  - a given unit can only ever pay out once per user (idempotent, via a
 *    completions/{unitId} doc created inside a transaction)
 *  - streak increments by at most 1 per real calendar day
 *  - every activity doc gets annotated with credited / rejectReason so the
 *    teacher dashboard can audit abuse attempts later if you want to surface
 *    that
 */
export const onActivityCreated = onDocumentCreated(
  "activities/{activityId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const activity = snap.data() as {
      userId?: string;
      unitId?: string;
    };

    const activityRef = snap.ref;
    const userId = activity.userId;
    const unitId = activity.unitId;

    if (!userId || !unitId) {
      await activityRef.update({ credited: false, rejectReason: "missing_fields" });
      return;
    }

    const canonicalReward = REWARD_TABLE[unitId];
    if (canonicalReward === undefined) {
      logger.warn(`Unknown unitId "${unitId}" from user ${userId} — refusing to credit.`);
      await activityRef.update({ credited: false, rejectReason: "unknown_unit" });
      return;
    }

    const userRef = db.collection("users").doc(userId);
    const completionRef = userRef.collection("completions").doc(unitId);

    try {
      await db.runTransaction(async (tx) => {
        const [userSnap, completionSnap] = await Promise.all([
          tx.get(userRef),
          tx.get(completionRef),
        ]);

        if (!userSnap.exists) {
          throw new Error("user_not_found");
        }

        if (completionSnap.exists) {
          // Already paid out for this unit — log it, don't pay twice.
          tx.update(activityRef, { credited: false, rejectReason: "already_completed" });
          return;
        }

        const userData = userSnap.data() as { streak?: number; lastActivityAt?: Timestamp };
        const now = new Date();
        const last = userData.lastActivityAt ? userData.lastActivityAt.toDate() : null;

        let nextStreak = userData.streak ?? 0;
        if (!last) {
          nextStreak = 1;
        } else if (isSameCalendarDay(last, now)) {
          // Already active today — streak doesn't change again today.
        } else if (isPreviousCalendarDay(last, now)) {
          nextStreak = nextStreak + 1;
        } else {
          // Gap of more than a day — streak resets.
          nextStreak = 1;
        }

        tx.set(completionRef, {
          unitId,
          creditedReward: canonicalReward,
          completedAt: FieldValue.serverTimestamp(),
        });

        tx.update(userRef, {
          stemios: FieldValue.increment(canonicalReward),
          streak: nextStreak,
          lastActivityAt: FieldValue.serverTimestamp(),
        });

        tx.update(activityRef, {
          credited: true,
          creditedReward: canonicalReward,
        });
      });
    } catch (err) {
      logger.error(`Failed to credit activity ${snap.id} for user ${userId}`, err);
      await activityRef
        .update({ credited: false, rejectReason: "internal_error" })
        .catch(() => {
          /* best-effort annotation only */
        });
    }
  }
);
