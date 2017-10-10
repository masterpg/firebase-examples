import * as express from 'express';
import auth from '../../middlewares/auth';
const cors = require('cors')({origin: true});
const cookieParser = require('cookie-parser')();

export class Router {

  constructor() {
    this.__base = express.Router();
    this.base.use(cors);

    this.__public = express.Router();

    this.__auth = express.Router();
    this.auth.use(cookieParser);
    this.auth.use(auth);
  }

  __base: express.Router;

  get base(): express.Router {
    return this.__base;
  }

  __public: express.Router;

  get public(): express.Router {
    return this.__public;
  }

  __auth: express.Router;

  get auth(): express.Router {
    return this.__auth;
  }

}


