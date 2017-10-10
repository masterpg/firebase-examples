import * as admin from 'firebase-admin';
import helpers from '../../helpers';

helpers.router.public.get('/addMessage', async (req, res) => {
  const original = req.query.text;
  const snapshot = await admin.database().ref('messages').push({original: original});
  res.redirect(303, snapshot.ref);
});
