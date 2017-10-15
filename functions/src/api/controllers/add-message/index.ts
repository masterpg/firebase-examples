import * as admin from 'firebase-admin';
import helpers from '../../helpers';

helpers.router.public.get('/addMessage', async (req, res) => {
  const original = req.query.text;
  const db = admin.firestore();
  const documentRef = await db.collection('messages').add({
    original: original,
  });
  res.sendStatus(200);
});
