import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Role } from '../types';

export function useUser(firebaseUser: FirebaseUser | null) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    let customUid = firebaseUser?.uid;

    if (!customUid) {
      const stored = localStorage.getItem('stemio_custom_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.id) {
            customUid = parsed.id;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (!customUid) {
      setUser(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', customUid);

    // Initial check/create
    const syncUser = async () => {
      try {
        const snap = await getDoc(userRef);
        if (!active) return;
        if (!firebaseUser && !localStorage.getItem('stemio_custom_user')) {
          setUser(null);
          return;
        }

        if (!snap.exists()) {
          const pendingCadetName = localStorage.getItem('pendingCadetName');
          const isQuickStart = firebaseUser?.email?.endsWith('@stemio.local');
          const nameToUse = (isQuickStart && pendingCadetName) ? pendingCadetName : (firebaseUser?.displayName || 'New User');
          
          if (isQuickStart && pendingCadetName) {
            localStorage.removeItem('pendingCadetName');
          }

          const userRole: Role = firebaseUser?.email === 'laankanom2018@gmail.com' ? 'teacher' : 'student';
          const userProfile = {
            id: customUid!,
            name: nameToUse,
            email: firebaseUser?.email || '',
            role: userRole,
            isAdmin: firebaseUser?.email === 'laankanom2018@gmail.com',
            stemios: 100, // Starting bonus
            streak: 0
          };

          await setDoc(userRef, userProfile, { merge: true });
          if (!active) return;

          const fullUser: User = {
            ...userProfile,
            completedQuizzes: [],
            completedLessons: []
          };

          if (active && (firebaseUser || localStorage.getItem('stemio_custom_user'))) {
            setUser(fullUser);
            localStorage.setItem('stemio_custom_user', JSON.stringify(fullUser));
          }
        } else {
          const data = snap.data();
          
          // Fetch completions from subcollection
          let completedQuizzes: string[] = [];
          try {
            const completionsCol = collection(db, 'users', customUid!, 'completions');
            const completionsSnap = await getDocs(completionsCol);
            completedQuizzes = completionsSnap.docs.map(d => d.id);
          } catch (e) {
            console.warn('Error fetching completions subcollection:', e);
          }

          if (!active) return;

          const fullUser: User = {
            id: data.id || customUid!,
            name: data.name || '',
            email: data.email || '',
            role: (data.role as Role) || 'student',
            isAdmin: !!data.isAdmin,
            stemios: data.stemios ?? 100,
            streak: data.streak ?? 0,
            completedQuizzes
          };

          if (active && (firebaseUser || localStorage.getItem('stemio_custom_user'))) {
            setUser(fullUser);
            localStorage.setItem('stemio_custom_user', JSON.stringify(fullUser));
          }
        }
      } catch (err) {
        console.error('Error syncing user:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    syncUser();

    // Listen for real-time updates (e.g. from activities)
    const unsubscribe = onSnapshot(userRef, async (snap) => {
      if (!active) return;
      if (!firebaseUser && !localStorage.getItem('stemio_custom_user')) {
        setUser(null);
        return;
      }

      if (snap.exists()) {
        const userData = snap.data();
        if (userData.email === 'laankanom2018@gmail.com' && !userData.isAdmin) {
          userData.isAdmin = true;
          userData.role = 'teacher';
          setDoc(userRef, { isAdmin: true, role: 'teacher' }, { merge: true });
        }

        let completedQuizzes: string[] = [];
        try {
          const completionsCol = collection(db, 'users', customUid!, 'completions');
          const completionsSnap = await getDocs(completionsCol);
          completedQuizzes = completionsSnap.docs.map(d => d.id);
        } catch (e) {
          console.warn('Error fetching completions on snapshot:', e);
        }

        if (!active) return;

        const fullUser: User = {
          id: userData.id || customUid!,
          name: userData.name || '',
          email: userData.email || '',
          role: (userData.role as Role) || 'student',
          isAdmin: !!userData.isAdmin,
          stemios: userData.stemios ?? 100,
          streak: userData.streak ?? 0,
          completedQuizzes
        };

        if (active && (firebaseUser || localStorage.getItem('stemio_custom_user'))) {
          setUser(fullUser);
          localStorage.setItem('stemio_custom_user', JSON.stringify(fullUser));
        }
      }
      if (active) setLoading(false);
    });

    const handleCustomUserUpdate = (e: any) => {
      if (!e.detail) {
        setUser(null);
      }
    };
    window.addEventListener('custom-user-updated', handleCustomUserUpdate);

    return () => {
      active = false;
      unsubscribe();
      window.removeEventListener('custom-user-updated', handleCustomUserUpdate);
    };
  }, [firebaseUser]);

  return { user, loading };
}
