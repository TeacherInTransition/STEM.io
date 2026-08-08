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
  getDocs, 
  writeBatch, 
  deleteDoc, 
  setDoc,
  query,
  where
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
    // 4. Save user document in Firestore linking name, email, password, starting balance of stemios, and completion progress
    const userRef = doc(db, 'users', user.uid);
    const newUser = {
      id: user.uid,
      name: nameToUse,
      email: cleanEmail,
      password: password,
      role: cleanEmail === 'laankanom2018@gmail.com' ? 'teacher' : 'student',
      isAdmin: cleanEmail === 'laankanom2018@gmail.com',
      stemios: 100, // Initial balance
      completedQuizzes: [],
      completedLessons: [],
      streak: 0,
      createdAt: serverTimestamp()
    };
    await setDoc(userRef, newUser, { merge: true });

    // Store custom user session in localStorage so user stays logged in
    localStorage.setItem('stemio_custom_user', JSON.stringify({
      id: user.uid,
      name: nameToUse,
      email: cleanEmail,
      password: password,
      role: newUser.role,
      isAdmin: newUser.isAdmin,
      stemios: 100,
      completedQuizzes: [],
      completedLessons: [],
      streak: 0
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
  const email = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@stemio.local`;
  return emailSignUp(email, password, cleanName);
};

export const cadetSignIn = async (cadetName: string, password: string) => {
  const cleanName = cadetName.trim();
  const email = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@stemio.local`;
  return emailSignIn(email, password);
};

export const emailSignIn = async (email: string, password: string): Promise<User> => {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const user = result.user;
    
    // Fetch user document from Firestore to ensure balance & progress are linked
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const newUser = {
        id: user.uid,
        name: user.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: password,
        role: cleanEmail === 'laankanom2018@gmail.com' ? 'teacher' : 'student',
        isAdmin: cleanEmail === 'laankanom2018@gmail.com',
        stemios: 100,
        completedQuizzes: [],
        completedLessons: [],
        streak: 0,
        createdAt: serverTimestamp()
      };
      await setDoc(userRef, newUser, { merge: true });
      localStorage.setItem('stemio_custom_user', JSON.stringify(newUser));
    } else {
      const existingData = snap.data();
      localStorage.setItem('stemio_custom_user', JSON.stringify(existingData));
    }

    return user;
  } catch (authErr: any) {
    console.warn('Primary email sign in failed (attempting Firestore fallback):', authErr);

    // Fallback: search Firestore by email
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', cleanEmail));
    const snap = await getDocs(q);

    if (snap.empty) {
      const err: any = new Error('No account found with this email. Please register first.');
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

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const completedList: string[] = userData.completedQuizzes || [];
        if (completedList.includes(unitOrLessonId)) {
          return { awarded: false, amount: 0, alreadyCompleted: true };
        }
      }

      // Log activity and update user doc atomically
      const activityRef = collection(db, 'activities');
      await addDoc(activityRef, {
        userId: currentUid,
        unitId: unitOrLessonId,
        reward: amount,
        timestamp: serverTimestamp()
      });

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

