import * as admin from 'firebase-admin';

export default async function (): Promise<void> {
  const db = (admin as any).firestore();
  const document = db.doc('posts/intro-to-firestore');

  // Enter new data into the document.
  await document.set({
    title: 'Welcome to Firestore',
    body: 'Hello World',
  });
}
