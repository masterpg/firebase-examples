import * as functions from 'firebase-functions';
import * as express from 'express';
import helpers from './helpers';
import './controllers/hello';
import './controllers/add-message';

const app = express();
app.use('/api', helpers.router.base);
app.use('/api', helpers.router.public);
app.use('/api', helpers.router.auth);
const api = functions.https.onRequest(app);

export default api;
