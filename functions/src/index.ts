import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import api from './api';
import * as db from './db';
import {environment} from './environments/environment';

async function init() {
  console.log('production:', environment.production);
  admin.initializeApp(functions.config().firebase);
  await db.init();
}

init();

export {api};
export const upcaseMessages = db.upcaseMessages;