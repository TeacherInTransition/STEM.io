import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Role } from '../types';

export function useUser(firebaseUser: FirebaseUser | null) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        if (!snap.exists()) {
          const pendingCadetName = localStorage.getItem('pendingCadetName');
          const pendingPassword = localStorage.getItem('pendingPassword');
          const isQuickStart = firebaseUser?.email?.endsWith('@stemio.local');
          const nameToUse = (isQuickStart && pendingCadetName) ? pendingCadetName : (firebaseUser?.displayName || 'New User');
          
          if (isQuickStart && pendingCadetName) {
            localStorage.removeItem('pendingCadetName');
          }

          const newUser: User = {
            id: customUid!,
            name: nameToUse,
            email: firebaseUser?.email || '',
            password: pendingPassword || '',
            role: firebaseUser?.email === 'laankanom2018@gmail.com' ? 'teacher' : 'student',
            isAdmin: firebaseUser?.email === 'laankanom2018@gmail.com',
            stemios: 100, // Starting bonus
            streak: 0,
            completedQuizzes: [],
            completedLessons: []
          };
          await setDoc(userRef, newUser, { merge: true });
          setUser(newUser);
          localStorage.setItem('stemio_custom_user', JSON.stringify(newUser));
        } else {
          const data = snap.data() as User;
          setUser(data);
          localStorage.setItem('stemio_custom_user', JSON.stringify(data));
        }
      } catch (err) {
        console.error('Error syncing user:', err);
      } finally {
        setLoading(false);
      }
    };

    syncUser();

    // Listen for real-time updates (e.g. from activities)
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const userData = snap.data() as User;
        if (userData.email === 'laankanom2018@gmail.com' && !userData.isAdmin) {
          userData.isAdmin = true;
          userData.role = 'teacher';
          setDoc(userRef, { isAdmin: true, role: 'teacher' }, { merge: true });
        }
        setUser(userData);
        localStorage.setItem('stemio_custom_user', JSON.stringify(userData));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  return { user, loading };
}
