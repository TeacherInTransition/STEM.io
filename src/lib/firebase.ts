import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signInAnonymously,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  updateDoc, 
  increment, 
  collection, 
  addDoc, 
  serverTimestamp, 
  getDoc, 
  arrayUnion, 
  arrayRemove,
  getDocs, 
  writeBatch, 
  deleteDoc, 
  setDoc,
  query,
  where,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

const provider = new GoogleAuthProvider();

const SCOPES = [
  "https://www.googleapis.com/auth/classroom.addons.student",
  "https://www.googleapis.com/auth/classroom.addons.teacher",
  "https://www.googleapis.com/auth/classroom.announcements",
  "https://www.googleapis.com/auth/classroom.announcements.readonly",
  "https://www.googleapis.com/auth/classroom.courses",
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.students",
  "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
  "https://www.googleapis.com/auth/classroom.courseworkmaterials",
  "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
  "https://www.googleapis.com/auth/classroom.guardianlinks.me.readonly",
  "https://www.googleapis.com/auth/classroom.guardianlinks.students",
  "https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
  "https://www.googleapis.com/auth/classroom.profile.photos",
  "https://www.googleapis.com/auth/classroom.push-notifications",
  "https://www.googleapis.com/auth/classroom.rosters",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",
  "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
  "https://www.googleapis.com/auth/classroom.topics",
  "https://www.googleapis.com/auth/classroom.topics.readonly",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.activity",
  "https://www.googleapis.com/auth/drive.activity.readonly",
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/drive.apps.readonly",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.install",
  "https://www.googleapis.com/auth/drive.meet.readonly",
  "https://www.googleapis.com/auth/drive.metadata",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/drive.photos.readonly",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.scripts",
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.addons.current.action.compose",
  "https://www.googleapis.com/auth/gmail.addons.current.message.action",
  "https://www.googleapis.com/auth/gmail.addons.current.message.metadata",
  "https://www.googleapis.com/auth/gmail.addons.current.message.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.insert",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://www.googleapis.com/auth/gmail.metadata",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.settings.basic",
  "https://www.googleapis.com/auth/gmail.settings.sharing"
];

SCOPES.forEach(scope => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // For email/password login, we won't have a Workspace access token initially
        // but the user is still authenticated.
        if (onAuthSuccess) onAuthSuccess(user, "");
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const anonymousSignIn = async (displayName: string): Promise<User> => {
  const randomId = Math.random().toString(36).substring(2, 10);
  const fakeEmail = `cadet_${randomId}@stemio.local`;
  const fakePassword = `Pass_${randomId}_${Date.now()}`;
  return emailSignUp(fakeEmail, fakePassword, displayName);
};

export const emailSignUp = async (email: string, password: string, displayName?: string): Promise<User> => {
  const cleanEmail = email.trim().toLowerCase();
  const nameToUse = displayName?.trim() || cleanEmail.split('@')[0];

  // 1. Check if email already registered in Firestore
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const err: any = new Error('An account with this email already exists. Please sign in.');
      err.code = 'auth/email-already-in-use';
      throw err;
    }
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') throw e;
    console.warn('Firestore user check note:', e);
  }

  let user: User | null = null;

  // 2. Try standard Firebase email/password creation
  try {
    const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    user = result.user;
    if (nameToUse) {
      await updateProfile(user, { displayName: nameToUse });
    }
  } catch (authErr: any) {
    console.warn('Primary email registration notice:', authErr);
    if (authErr.code === 'auth/email-already-in-use') {
      throw authErr;
    }

    // 3. Fallback: try anonymous authentication if email provider is disabled
    try {
      const anonResult = await signInAnonymously(auth);
      user = anonResult.user;
      if (nameToUse) {
        await updateProfile(user, { displayName: nameToUse });
      }
    } catch (anonErr: any) {
      console.warn('Anonymous auth fallback note:', anonErr);
      // Create synthetic user session
      const syntheticId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      user = {
        uid: syntheticId,
        email: cleanEmail,
        displayName: nameToUse,
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => '',
        getIdTokenResult: async () => ({} as any),
        reload: async () => {},
        toJSON: () => ({}),
        phoneNumber: null,
        photoURL: null,
        providerId: 'custom'
      } as unknown as User;
    }
  }

  if (user) {
    // 4. Save user document in Firestore with strictly required schema keys
    const userRef = doc(db, 'users', user.uid);
    const userProfile = {
      id: user.uid,
      name: nameToUse,
      email: cleanEmail,
      role: cleanEmail === 'laankanom2018@gmail.com' ? 'teacher' : 'student',
      isAdmin: cleanEmail === 'laankanom2018@gmail.com',
      stemios: 100, // Initial balance
      streak: 0
    };
    await setDoc(userRef, userProfile, { merge: true });

    // Store custom user session in localStorage so user stays logged in
    localStorage.setItem('stemio_custom_user', JSON.stringify({
      ...userProfile,
      password: password,
      completedQuizzes: []
    }));

    try {
      if (auth.currentUser && !auth.currentUser.isAnonymous) {
        await sendEmailVerification(auth.currentUser);
      }
    } catch (e) {
      console.warn('Non-blocking verification email:', e);
    }
  }

  return user!;
};

export const cadetSignUp = async (cadetName: string, password: string) => {
  const cleanName = cadetName.trim();
  if (!cleanName) {
    const err: any = new Error('Please enter a Cadet Name.');
    err.code = 'auth/invalid-email';
    throw err;
  }

  // Check if cadet name is already registered in Firestore
  const usersCol = collection(db, 'users');
  const qName = query(usersCol, where('name', '==', cleanName));
  const snapName = await getDocs(qName);
  if (!snapName.empty) {
    const err: any = new Error(`Cadet name "${cleanName}" is already taken. Click "Sign In" or choose another name.`);
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  const email = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@stemio.local`;
  return emailSignUp(email, password, cleanName);
};

export const cadetSignIn = async (cadetName: string, password: string) => {
  const cleanName = cadetName.trim();
  const syntheticEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@stemio.local`;

  // 1. Try synthetic email with Firebase Auth first
  try {
    const result = await signInWithEmailAndPassword(auth, syntheticEmail, password);
    const user = result.user;
    
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const userProfile = {
        id: user.uid,
        name: cleanName,
        email: syntheticEmail,
        role: 'student',
        isAdmin: false,
        stemios: 100,
        streak: 0
      };
      await setDoc(userRef, userProfile, { merge: true });
      localStorage.setItem('stemio_custom_user', JSON.stringify({ ...userProfile, password, completedQuizzes: [] }));
    } else {
      localStorage.setItem('stemio_custom_user', JSON.stringify(snap.data()));
    }
    return user;
  } catch (err: any) {
    // 2. Synthetic email sign in failed. Search Firestore users collection by name or email
    const usersCol = collection(db, 'users');
    let matchedDocData: any = null;
    let matchedDocId: string | null = null;

    // Search by exact name
    const qName = query(usersCol, where('name', '==', cleanName));
    let snap = await getDocs(qName);

    if (!snap.empty) {
      matchedDocId = snap.docs[0].id;
      matchedDocData = snap.docs[0].data();
    } else {
      // Search by synthetic email
      const qEmail = query(usersCol, where('email', '==', syntheticEmail));
      snap = await getDocs(qEmail);
      if (!snap.empty) {
        matchedDocId = snap.docs[0].id;
        matchedDocData = snap.docs[0].data();
      } else {
        // Broad search (case-insensitive match)
        const allUsersSnap = await getDocs(query(usersCol, limit(50)));
        const matched = allUsersSnap.docs.find(d => {
          const data = d.data();
          return (data.name && data.name.trim().toLowerCase() === cleanName.toLowerCase()) ||
                 (data.email && data.email.trim().toLowerCase() === syntheticEmail);
        });

        if (matched) {
          matchedDocId = matched.id;
          matchedDocData = matched.data();
        }
      }
    }

    if (!matchedDocData || !matchedDocId) {
      const error: any = new Error(`Cadet "${cleanName}" was not found or password is incorrect. If you are new, click "Register".`);
      error.code = 'auth/user-not-found';
      throw error;
    }

    // A matching user record was found! Get their real email
    const userRealEmail = matchedDocData.email || syntheticEmail;

    // Attempt Firebase Auth with their real email and entered password
    try {
      const realAuthRes = await signInWithEmailAndPassword(auth, userRealEmail, password);
      localStorage.setItem('stemio_custom_user', JSON.stringify({ id: matchedDocId, ...matchedDocData }));
      return realAuthRes.user;
    } catch (realAuthErr: any) {
      // Password check fallback
      if (matchedDocData.password && matchedDocData.password !== password) {
        const error: any = new Error('Invalid Secret Passcode.');
        error.code = 'auth/wrong-password';
        throw error;
      }

      if (realAuthErr.code === 'auth/wrong-password' || realAuthErr.code === 'auth/invalid-credential') {
        const error: any = new Error('Invalid Secret Passcode.');
        error.code = 'auth/wrong-password';
        throw error;
      }

      // Anonymous session fallback
      let activeUser: User | null = auth.currentUser;
      if (!activeUser) {
        try {
          const anonRes = await signInAnonymously(auth);
          activeUser = anonRes.user;
        } catch (e) {
          console.warn('Anon auth during cadet fallback:', e);
        }
      }

      if (!activeUser) {
        activeUser = {
          uid: matchedDocId,
          email: userRealEmail,
          displayName: matchedDocData.name || cleanName,
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: '',
          tenantId: null,
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async () => ({} as any),
          reload: async () => {},
          toJSON: () => ({}),
          phoneNumber: null,
          photoURL: null,
          providerId: 'custom'
        } as unknown as User;
      }

      localStorage.setItem('stemio_custom_user', JSON.stringify({ id: matchedDocId, ...matchedDocData }));
      return activeUser;
    }
  }
};

export const emailSignIn = async (email: string, password: string): Promise<User> => {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = result.user;
    
    // Fetch user document from Firestore
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const userProfile = {
        id: user.uid,
        name: user.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: cleanEmail === 'laankanom2018@gmail.com' ? 'teacher' : 'student',
        isAdmin: cleanEmail === 'laankanom2018@gmail.com',
        stemios: 100,
        streak: 0
      };
      await setDoc(userRef, userProfile, { merge: true });
      localStorage.setItem('stemio_custom_user', JSON.stringify({ ...userProfile, password, completedQuizzes: [] }));
    } else {
      const existingData = snap.data();
      localStorage.setItem('stemio_custom_user', JSON.stringify(existingData));
    }

    return user;
  } catch (authErr: any) {
    console.warn('Primary email sign in failed (attempting Firestore fallback):', authErr);

    // Fallback: search Firestore by email or name
    const usersCol = collection(db, 'users');
    let q = query(usersCol, where('email', '==', cleanEmail));
    let snap = await getDocs(q);

    if (snap.empty) {
      q = query(usersCol, where('name', '==', cleanEmail));
      snap = await getDocs(q);
    }

    if (snap.empty) {
      const err: any = new Error('No account found. Please register first.');
      err.code = 'auth/user-not-found';
      throw err;
    }

    const matchedDoc = snap.docs[0];
    const userData = matchedDoc.data();

    if (userData.password && userData.password !== password) {
      const err: any = new Error('Invalid email or password.');
      err.code = 'auth/wrong-password';
      throw err;
    }

    // Password matches! Try signing in anonymously if auth isn't active
    let activeUser: User | null = auth.currentUser;
    if (!activeUser) {
      try {
        const anonRes = await signInAnonymously(auth);
        activeUser = anonRes.user;
      } catch (e) {
        console.warn('Anonymous sign in during fallback:', e);
      }
    }

    if (!activeUser) {
      activeUser = {
        uid: matchedDoc.id,
        email: cleanEmail,
        displayName: userData.name || cleanEmail.split('@')[0],
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => '',
        getIdTokenResult: async () => ({} as any),
        reload: async () => {},
        toJSON: () => ({}),
        phoneNumber: null,
        photoURL: null,
        providerId: 'custom'
      } as unknown as User;
    }

    localStorage.setItem('stemio_custom_user', JSON.stringify({ id: matchedDoc.id, ...userData }));
    return activeUser;
  }
};

export const verifyEmail = async () => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  localStorage.removeItem('stemio_custom_user');
  try {
    await auth.signOut();
  } catch (e) {
    console.error('Logout note:', e);
  }
  cachedAccessToken = null;
};

// Activity Logging & Rewards
export const logActivity = async (userId: string, unitId: string, reward: number) => {
  if (userId.startsWith('guest_')) return;
  
  try {
    const activityRef = collection(db, 'activities');
    await addDoc(activityRef, {
      userId,
      unitId,
      reward,
      timestamp: serverTimestamp()
    });

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      stemios: increment(reward)
    });
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};

export const awardStemios = async (
  userId?: string, 
  unitOrLessonId: string = 'quiz_checkpoint', 
  amount: number = 50
): Promise<{ awarded: boolean; amount: number; alreadyCompleted: boolean }> => {
  // 1. Guest User Check
  const savedGuest = localStorage.getItem('stemio_guest_user');
  if (savedGuest) {
    try {
      const guest = JSON.parse(savedGuest);
      const completedList: string[] = guest.completedQuizzes || [];
      
      if (completedList.includes(unitOrLessonId)) {
        return { awarded: false, amount: 0, alreadyCompleted: true };
      }

      guest.stemios = (guest.stemios || 0) + amount;
      guest.completedQuizzes = [...completedList, unitOrLessonId];
      localStorage.setItem('stemio_guest_user', JSON.stringify(guest));
      window.dispatchEvent(new CustomEvent('guest-user-updated', { detail: guest }));
      return { awarded: true, amount, alreadyCompleted: false };
    } catch (e) {
      console.error('Error updating guest stemios:', e);
    }
  }

  // 2. Authenticated Firebase User Check
  const currentUid = (userId && !userId.startsWith('guest_')) ? userId : auth.currentUser?.uid;
  if (currentUid && !currentUid.startsWith('guest_')) {
    try {
      const userRef = doc(db, 'users', currentUid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && ((userSnap.data() as any).completedQuizzes ?? []).includes(unitOrLessonId)) {
        return { awarded: false, amount: 0, alreadyCompleted: true };
      }

      // Log activity
      const activityRef = collection(db, 'activities');
      await addDoc(activityRef, {
        userId: currentUid,
        unitId: unitOrLessonId,
        reward: amount,
        timestamp: serverTimestamp()
      });

      // Record completion + increment balance atomically on the root user doc.
      // (users/{uid}/completions subcollection is not allowed by live rules)
      await updateDoc(userRef, {
        stemios: increment(amount),
        completedQuizzes: arrayUnion(unitOrLessonId)
      });

      return { awarded: true, amount, alreadyCompleted: false };
    } catch (err) {
      console.error('Error awarding stemios:', err);
    }
  }

  return { awarded: false, amount: 0, alreadyCompleted: false };
};

// Resource Item Interface
export interface ResourceItem {
  id: string;
  title: string;
  type: 'Video' | 'Document' | 'Link' | 'Spreadsheet' | 'Cheat Sheet';
  url: string;
  lessonId: string;
  description: string;
  views: number;
}

export const DEFAULT_RESOURCES: ResourceItem[] = [
  {
    id: "res-1",
    title: "AI vs ML vs DL Venn Diagram Explainer",
    type: "Document",
    url: "https://cloud.google.com/learn/artificial-intelligence-vs-machine-learning",
    lessonId: "u1",
    description: "An easy-to-understand visual guide by Google Cloud explaining the relationship between AI, Machine Learning, and Deep Learning.",
    views: 42
  },
  {
    id: "res-2",
    title: "Introduction to Artificial Intelligence (Class Video)",
    type: "Video",
    url: "https://www.youtube.com/watch?v=ad79nYk2kEg",
    lessonId: "u1",
    description: "A comprehensive video lesson on what intelligence is, how machines simulate human behavior, and standard real-world ANI examples.",
    views: 58
  },
  {
    id: "res-3",
    title: "Bias Auditor Lab Data & Case Study",
    type: "Spreadsheet",
    url: "https://docs.google.com/spreadsheets/d/1X5X8yv_Xy-F-V9876_case_study/edit?usp=sharing",
    lessonId: "u2",
    description: "A class spreadsheet template containing demographic parameters for auditing training classification sets and identifying imbalances.",
    views: 29
  },
  {
    id: "res-4",
    title: "The Ethics of AI & Transparency (FAT)",
    type: "Document",
    url: "https://arxiv.org/pdf/1908.06165.pdf",
    lessonId: "u3",
    description: "Academic handbook introducing Fairness, Accountability, and Transparency frameworks in automated decision-making systems.",
    views: 18
  },
  {
    id: "res-5",
    title: "Intro to Neural Networks (3Blue1Brown)",
    type: "Video",
    url: "https://www.youtube.com/watch?v=aircAruvnKk",
    lessonId: "u9",
    description: "A masterpiece of visual explanation detailing what artificial neural networks are, how they are structured, and why weights and biases are tuned.",
    views: 74
  },
  {
    id: "res-6",
    title: "MUIDS Python Basics Cheat Sheet",
    type: "Cheat Sheet",
    url: "https://github.com/muids-stem/python-basics-cheatsheet",
    lessonId: "python-basics",
    description: "Syntax references, variable declarations, loops, function signatures, and simple sorting loops tailored for Grade 10 computing.",
    views: 31
  },
  {
    id: "res-7",
    title: "Silicon Hardware GPU Parallelization Model",
    type: "Spreadsheet",
    url: "https://docs.google.com/spreadsheets/d/1gpu_parallelization_matrix/edit?usp=sharing",
    lessonId: "s1",
    description: "A comparative dataset sheet showing instruction counts, latency vs throughput calculations for CPU vs GPU architectures.",
    views: 25
  },
  {
    id: "res-8",
    title: "Adversarial Phishing Simulation Analysis",
    type: "Link",
    url: "https://www.cisa.gov/resources-tools/resources/phishing-infographics",
    lessonId: "c1",
    description: "Official security resources for identifying social engineering headers, deepfake verification steps, and prompt-injection defense guides.",
    views: 12
  }
];

// Fetch all resources, with local fallback for guests / new instances
export const fetchResourcesFromDb = async (): Promise<ResourceItem[]> => {
  const cached = localStorage.getItem('stemio_cached_resources');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Error parsing cached resources', e);
    }
  }

  try {
    const resourcesCol = collection(db, 'resources');
    const snap = await getDocs(resourcesCol);
    if (!snap.empty) {
      const dbResources: ResourceItem[] = [];
      snap.forEach(docSnap => {
        dbResources.push({ id: docSnap.id, ...docSnap.data() } as any);
      });
      localStorage.setItem('stemio_cached_resources', JSON.stringify(dbResources));
      return dbResources;
    }
  } catch (err) {
    console.warn('Firestore fetch failed/unprovisioned, using default resources:', err);
  }

  localStorage.setItem('stemio_cached_resources', JSON.stringify(DEFAULT_RESOURCES));
  return DEFAULT_RESOURCES;
};

// Record student resource open event in Firestore & update analytics
export interface ResourceOpenRecord {
  id?: string;
  userId: string;
  resourceId: string;
  lessonId: string;
  openedAt?: any;
}

export const recordResourceOpen = async (
  userId: string,
  resourceId: string,
  lessonId?: string
): Promise<{ success: boolean; isFirstOpen: boolean }> => {
  if (!userId) return { success: false, isFirstOpen: false };

  let isFirstOpen = false;

  // 1. Update localStorage completed resources list for instant UI responsiveness
  try {
    const key = `stemio_completed_resources_${userId}`;
    const saved = localStorage.getItem(key);
    const completedList: string[] = saved ? JSON.parse(saved) : [];
    if (!completedList.includes(resourceId)) {
      isFirstOpen = true;
      const updated = [...completedList, resourceId];
      localStorage.setItem(key, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Local resource open error:', e);
  }

  // 2. Persist to Firestore if available
  try {
    if (db && !userId.startsWith('guest_')) {
      // Increment view count on resource doc
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, { views: increment(1) }).catch(() => {});

      // Add log entry to resource_opens collection
      const opensCol = collection(db, 'resource_opens');
      await addDoc(opensCol, {
        userId,
        resourceId,
        lessonId: lessonId || 'general',
        openedAt: serverTimestamp()
      });

      // Award +10 Stemios for opening a new resource
      if (isFirstOpen) {
        await awardStemios(userId, `resource_open_${resourceId}`, 10);
      }
    }
  } catch (e) {
    console.warn('Firestore recordResourceOpen note:', e);
  }

  return { success: true, isFirstOpen };
};

// Fetch all recorded student resource open events from Firestore
export const fetchResourceOpens = async (): Promise<ResourceOpenRecord[]> => {
  try {
    const opensCol = collection(db, 'resource_opens');
    const snap = await getDocs(opensCol);
    const records: ResourceOpenRecord[] = [];
    snap.forEach(docSnap => {
      records.push({ id: docSnap.id, ...docSnap.data() } as ResourceOpenRecord);
    });
    return records;
  } catch (e) {
    console.warn('Error fetching resource_opens:', e);
    return [];
  }
};

// Fetch ONLY active student profiles (excluding admin & teacher profiles)
export const fetchStudentUsers = async (): Promise<any[]> => {
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    const studentList: any[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      // Filter out teachers and admins strictly
      const isTeacherOrAdmin = data.role === 'teacher' || data.isAdmin === true || data.email === 'laankanom2018@gmail.com';
      if (!isTeacherOrAdmin && (data.role === 'student' || !data.role)) {
        studentList.push({ id: docSnap.id, ...data });
      }
    });
    return studentList;
  } catch (e) {
    console.warn('Error fetching student users:', e);
    return [];
  }
};

// Bulk save resources
export const saveResourcesToDb = async (resources: ResourceItem[]): Promise<boolean> => {
  localStorage.setItem('stemio_cached_resources', JSON.stringify(resources));

  if (auth.currentUser && !auth.currentUser.uid.startsWith('guest_')) {
    try {
      const batch = writeBatch(db);
      for (const item of resources) {
        const itemRef = doc(db, 'resources', item.id);
        batch.set(itemRef, {
          title: item.title,
          type: item.type,
          url: item.url,
          lessonId: item.lessonId,
          description: item.description,
          views: item.views || 0
        });
      }
      await batch.commit();
      return true;
    } catch (err) {
      console.error('Error saving resources to Firestore:', err);
      return false;
    }
  }
  return true;
};

// ==========================================
// VIRTUAL CLASSROOM ROSTER & JOIN CODE SYSTEM
// ==========================================

export interface VirtualClassroom {
  classId: string;
  googleClassroomCourseId?: string;
  name: string;
  joinCode: string;
  studentIds: string[];
  createdAt: string;
  teacherId?: string;
  description?: string;
}

export const DEFAULT_CLASSROOMS: VirtualClassroom[] = [
  {
    classId: 'class-stem-10a',
    name: 'Grade 10 STEM - Section 10A',
    joinCode: 'STEM10A',
    googleClassroomCourseId: 'gc-course-78921',
    studentIds: ['mock1', 'mock2'],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    description: 'Grade 10 Physics, Robotics & AI Foundations Cohort'
  },
  {
    classId: 'class-ai-10b',
    name: 'Grade 10 Computing & AI - Section 10B',
    joinCode: 'AI10B2026',
    googleClassroomCourseId: 'gc-course-90412',
    studentIds: [],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    description: 'Machine Learning & Ethics Exploration Lab'
  }
];

// Fetch all virtual classrooms from Firestore or localStorage fallback
export const fetchVirtualClassrooms = async (): Promise<VirtualClassroom[]> => {
  const localSaved = localStorage.getItem('stemio_virtual_classrooms');
  let localList: VirtualClassroom[] = localSaved ? JSON.parse(localSaved) : DEFAULT_CLASSROOMS;

  try {
    const classesCol = collection(db, 'classes');
    const snap = await getDocs(classesCol);
    if (!snap.empty) {
      const dbClasses: VirtualClassroom[] = [];
      snap.forEach(docSnap => {
        dbClasses.push({ classId: docSnap.id, ...docSnap.data() } as VirtualClassroom);
      });
      localStorage.setItem('stemio_virtual_classrooms', JSON.stringify(dbClasses));
      return dbClasses;
    } else {
      // Seed default classrooms to Firestore if empty
      for (const cls of DEFAULT_CLASSROOMS) {
        await setDoc(doc(db, 'classes', cls.classId), cls).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('Firestore classrooms fetch note (using local fallback):', err);
  }

  return localList;
};

// Create a new Virtual Classroom
export const createVirtualClassroom = async (
  name: string,
  googleClassroomCourseId?: string,
  teacherId?: string,
  description?: string
): Promise<VirtualClassroom> => {
  const cleanName = name.trim();
  const rawCode = cleanName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const joinCode = rawCode ? `${rawCode}-${randomSuffix}` : `STEM-${randomSuffix}`;
  
  const classId = `class_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  
  const newClassroom: VirtualClassroom = {
    classId,
    name: cleanName,
    joinCode,
    googleClassroomCourseId: googleClassroomCourseId?.trim() || '',
    studentIds: [],
    createdAt: new Date().toISOString(),
    teacherId: teacherId || auth.currentUser?.uid || 'teacher-1',
    description: description?.trim() || 'Grade 10 STEM Virtual Classroom Track'
  };

  // 1. Local state update
  const currentList = await fetchVirtualClassrooms();
  const updatedList = [newClassroom, ...currentList];
  localStorage.setItem('stemio_virtual_classrooms', JSON.stringify(updatedList));

  // 2. Persist to Firestore
  try {
    await setDoc(doc(db, 'classes', classId), newClassroom);
  } catch (err) {
    console.warn('Firestore setDoc for classroom note:', err);
  }

  return newClassroom;
};

// Student One-Click Join Class via joinCode
export const joinClassByCode = async (
  joinCode: string,
  studentUid: string,
  studentName?: string
): Promise<{ success: boolean; classroom?: VirtualClassroom; message: string }> => {
  const cleanCode = joinCode.trim().toUpperCase();
  if (!cleanCode) {
    return { success: false, message: 'Please enter a valid Class Join Code.' };
  }

  const allClassrooms = await fetchVirtualClassrooms();
  const matched = allClassrooms.find(c => c.joinCode.toUpperCase() === cleanCode || c.classId === joinCode);

  if (!matched) {
    return { success: false, message: `No classroom found with Join Code "${cleanCode}". Please check with your teacher.` };
  }

  const classId = matched.classId;

  // Check if student is already enrolled
  if (matched.studentIds.includes(studentUid)) {
    // Update student local user profile classId
    const localUser = localStorage.getItem('stemio_custom_user');
    if (localUser) {
      try {
        const u = JSON.parse(localUser);
        u.classId = classId;
        localStorage.setItem('stemio_custom_user', JSON.stringify(u));
      } catch (e) {}
    }
    const guestUser = localStorage.getItem('stemio_guest_user');
    if (guestUser) {
      try {
        const g = JSON.parse(guestUser);
        g.classId = classId;
        localStorage.setItem('stemio_guest_user', JSON.stringify(g));
        window.dispatchEvent(new CustomEvent('guest-user-updated', { detail: g }));
      } catch (e) {}
    }

    return { 
      success: true, 
      classroom: matched, 
      message: `You are already enrolled in "${matched.name}".` 
    };
  }

  // 1. Update local classrooms state
  const updatedStudentIds = [...matched.studentIds, studentUid];
  const updatedClassroom = { ...matched, studentIds: updatedStudentIds };
  const updatedClassrooms = allClassrooms.map(c => c.classId === classId ? updatedClassroom : c);
  localStorage.setItem('stemio_virtual_classrooms', JSON.stringify(updatedClassrooms));

  // Update student profile classId in local storage
  const localUser = localStorage.getItem('stemio_custom_user');
  if (localUser) {
    try {
      const u = JSON.parse(localUser);
      u.classId = classId;
      localStorage.setItem('stemio_custom_user', JSON.stringify(u));
    } catch (e) {}
  }
  const guestUser = localStorage.getItem('stemio_guest_user');
  if (guestUser) {
    try {
      const g = JSON.parse(guestUser);
      g.classId = classId;
      localStorage.setItem('stemio_guest_user', JSON.stringify(g));
      window.dispatchEvent(new CustomEvent('guest-user-updated', { detail: g }));
    } catch (e) {}
  }

  // 2. Persist in Firestore using arrayUnion on classes/{classId} and updating user profile
  try {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
      studentIds: arrayUnion(studentUid)
    });

    if (studentUid && !studentUid.startsWith('guest_')) {
      const userRef = doc(db, 'users', studentUid);
      await updateDoc(userRef, {
        classId: classId
      });
    }
  } catch (err) {
    console.warn('Firestore joinClassByCode update note:', err);
  }

  return {
    success: true,
    classroom: updatedClassroom,
    message: `Successfully joined classroom "${matched.name}"!`
  };
};

// Remove a student from a virtual classroom
export const removeClassStudent = async (classId: string, studentUid: string): Promise<boolean> => {
  // Update local state
  const allClassrooms = await fetchVirtualClassrooms();
  const matched = allClassrooms.find(c => c.classId === classId);
  if (matched) {
    const updatedStudentIds = matched.studentIds.filter(id => id !== studentUid);
    const updatedClassrooms = allClassrooms.map(c => c.classId === classId ? { ...c, studentIds: updatedStudentIds } : c);
    localStorage.setItem('stemio_virtual_classrooms', JSON.stringify(updatedClassrooms));
  }

  // Update Firestore
  try {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
      studentIds: arrayRemove(studentUid)
    });

    if (!studentUid.startsWith('guest_')) {
      const userRef = doc(db, 'users', studentUid);
      await updateDoc(userRef, {
        classId: ''
      });
    }
    return true;
  } catch (err) {
    console.warn('Firestore removeClassStudent note:', err);
    return false;
  }
};

// Delete a virtual classroom
export const deleteVirtualClassroom = async (classId: string): Promise<boolean> => {
  const currentList = await fetchVirtualClassrooms();
  const updatedList = currentList.filter(c => c.classId !== classId);
  localStorage.setItem('stemio_virtual_classrooms', JSON.stringify(updatedList));

  try {
    await deleteDoc(doc(db, 'classes', classId));
    return true;
  } catch (err) {
    console.warn('Firestore deleteVirtualClassroom note:', err);
    return false;
  }
};



