import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    if (data.email === 'laankanom2018@gmail.com') {
      console.log('Found user, making admin:', userDoc.id);
      await updateDoc(doc(db, 'users', userDoc.id), { isAdmin: true, role: 'teacher' });
    }
  }
}
run().then(() => process.exit(0)).catch(console.error);
