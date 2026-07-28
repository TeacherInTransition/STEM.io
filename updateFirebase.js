import fs from 'fs';

let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const newAuthCode = `
export const cadetSignUp = async (cadetName: string, password: string) => {
  const email = \`\${cadetName.toLowerCase().replace(/[^a-z0-9]/g, '')}@stemio.local\`;
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: cadetName });
  return result.user;
};

export const cadetSignIn = async (cadetName: string, password: string) => {
  const email = \`\${cadetName.toLowerCase().replace(/[^a-z0-9]/g, '')}@stemio.local\`;
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};
`;

code = code.replace('export const emailSignIn = async', newAuthCode + '\nexport const emailSignIn = async');

fs.writeFileSync('src/lib/firebase.ts', code);
console.log('Added cadet functions to firebase.ts');
