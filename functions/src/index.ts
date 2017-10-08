import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
admin.initializeApp(functions.config().firebase);

import * as express from 'express';
const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});
const app = express();
const router = express.Router();

import {environment} from './environments/environment';
console.log('production:', environment.production);


// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req: functions.Request, res: functions.Response,
                                       next: express.NextFunction) => {
  console.log('Check if request is authorized with Firebase ID token');

  const authorization = req.headers['authorization'] as string;
  if ((!authorization || !authorization.startsWith('Bearer ')) &&
    !req.cookies.__session) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.');
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (authorization && authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header');
    // Read the ID Token from the Authorization header.
    idToken = authorization.split('Bearer ')[1];
  } else {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  }

  let decodedIdToken: admin.auth.DecodedIdToken;
  try {
    decodedIdToken = await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    console.error('Error while verifying Firebase ID token:', err);
    res.status(403).send('Unauthorized');
    return;
  }
  console.log('ID Token correctly decoded', decodedIdToken);
  (req as any).user = decodedIdToken;

  next();
};

router.use(cors);
router.use(cookieParser);
router.use(validateFirebaseIdToken);
router.get('/hello', (req, res) => {
  res.send(`Hello ${(req as any).user.name}`);
});

app.use('/api', router);

// This HTTPS endpoint can only be accessed by your Firebase Users.
// Requests need to be authorized by providing an `Authorization` HTTP header
// with value `Bearer <Firebase ID Token>`.
exports.api = functions.https.onRequest(app);
