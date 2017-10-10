import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import api from './api';
import * as db from './db';
import {environment} from './environments/environment';

admin.initializeApp(functions.config().firebase);

console.log('production:', environment.production);

export {api};
export const upcaseMessages = db.upcaseMessages;