import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Role } from '../types';

export function useUser(firebaseUser: FirebaseUser | null) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', firebaseUser.uid);

    // Initial check/create
    const syncUser = async () => {
      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const pendingCadetName = localStorage.getItem('pendingCadetName');
          const isQuickStart = firebaseUser.email?.endsWith('@stemio.local');
          const nameToUse = isQuickStart && pendingCadetName ? pendingCadetName : (firebaseUser.displayName || 'New User');
          
          if (isQuickStart && pendingCadetName) {
              localStorage.removeItem('pendingCadetName');
          }

          const newUser: User = {
            id: firebaseUser.uid,
            name: nameToUse,
            email: firebaseUser.email || '',
            role: firebaseUser.email === 'laankanom2018@gmail.com' ? 'teacher' : 'student',
            isAdmin: firebaseUser.email === 'laankanom2018@gmail.com',
            stemios: 100, // Starting bonus
            streak: 0
          };
          await setDoc(userRef, newUser);
          setUser(newUser);
        }
      } catch (err) {
        console.error('Error syncing user:', err);
      }
    };

    syncUser();

    // Listen for real-time updates (e.g. from activities)
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const userData = snap.data() as User;
        if (userData.email === 'laankanom2018@gmail.com' && !userData.isAdmin) {
            // Force admin mode
            userData.isAdmin = true;
            userData.role = 'teacher';
            setDoc(userRef, { isAdmin: true, role: 'teacher' }, { merge: true });
        }
        setUser(userData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  return { user, loading };
}
