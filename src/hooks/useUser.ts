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
          const newUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'New User',
            email: firebaseUser.email || '',
            role: 'student' as Role,
            isAdmin: false,
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
        setUser(snap.data() as User);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  return { user, loading };
}
