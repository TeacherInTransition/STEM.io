import { onDocumentCreated, onDocumentWritten } from "firebase-functions/v2/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { logger } from "firebase-functions";
import sanitizeHtml from "sanitize-html";

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
 * Sanitize options for slide HTML content.
 * Strips script tags, iframes, inline event handlers (onload, onerror, etc.)
 */
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'br', 'span', 'div', 'img', 'code', 'pre', 'blockquote',
    'table', 'thead', 'tbody', 'tr', 'td', 'th'
  ],
  allowedAttributes: {
    'a': ['href', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height'],
    'div': ['class'],
    'span': ['class'],
    'code': ['class']
  },
  allowedSchemes: ['http', 'https', 'data']
};

/**
 * Fires whenever a client writes a new document to /activities (see
 * logActivity() in src/lib/firebase.ts). This is the ONLY place stemios and
 * streak are ever incremented — the client can no longer write those fields
 * directly (see the updated firestore.rules).
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
          // Already active today — streak doesn't change
        } else if (isPreviousCalendarDay(last, now)) {
          nextStreak = nextStreak + 1;
        } else {
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

/**
 * Server-side HTML Sanitization trigger for lessons.
 * Runs whenever a lesson document is created or updated.
 * Ensures any slide content containing HTML is thoroughly sanitized to prevent Stored XSS.
 */
export const onLessonWritten = onDocumentWritten(
  "lessons/{lessonId}",
  async (event) => {
    const afterSnap = event.data?.after;
    if (!afterSnap || !afterSnap.exists) return; // Document deleted

    const lessonData = afterSnap.data();
    if (!lessonData || !Array.isArray(lessonData.slides)) return;

    let modified = false;
    const sanitizedSlides = lessonData.slides.map((slide: any) => {
      if (slide && typeof slide.content === 'string') {
        const cleanContent = sanitizeHtml(slide.content, SANITIZE_OPTIONS);
        if (cleanContent !== slide.content) {
          modified = true;
          return { ...slide, content: cleanContent };
        }
      }
      return slide;
    });

    if (modified) {
      logger.info(`Sanitized HTML content in lesson "${event.params.lessonId}"`);
      await afterSnap.ref.update({
        slides: sanitizedSlides,
        sanitizedAt: FieldValue.serverTimestamp()
      });
    }
  }
);

/**
 * Callable function to assign Admin and Teacher custom claims to a target user.
 * Restricted to existing admins or initial bootstrap invocation.
 */
export const setUserAdminRole = onCall(async (request) => {
  const callerAuth = request.auth;
  if (!callerAuth) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }

  // Ensure caller is an admin (or handle initial bootstrap)
  const callerUid = callerAuth.uid;
  const callerUserDoc = await db.collection('users').doc(callerUid).get();
  const isCallerAdmin = callerAuth.token.admin === true || callerUserDoc.data()?.isAdmin === true;

  if (!isCallerAdmin) {
    throw new HttpsError('permission-denied', 'Only admins can grant admin privileges.');
  }

  const { targetUid } = request.data;
  if (!targetUid || typeof targetUid !== 'string') {
    throw new HttpsError('invalid-argument', 'targetUid is required.');
  }

  // Set Firebase Custom Auth Claims
  await getAuth().setCustomUserClaims(targetUid, { admin: true, teacher: true });

  // Update user document in Firestore
  await db.collection('users').doc(targetUid).set({
    isAdmin: true,
    role: 'teacher'
  }, { merge: true });

  logger.info(`Granted admin & teacher custom claims to user ${targetUid}`);
  return { success: true, targetUid };
});
