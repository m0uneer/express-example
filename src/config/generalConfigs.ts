import * as session from 'express-session';

// tslint:disable-next-line no-require-imports
const RedisStore = require('connect-redis')(session);

import { config } from './config';

export const sessionConfig = {
  resave: true,
  saveUninitialized: true,
  store: new RedisStore({ ...config.redis, prefix: 'express-session:' }),
  cookie: {
    path: '/',
    httpOnly: false,
    maxAge: 48 * 60 * 60 * 1000, // 2 days
  },
};

export const BODY_PARSER_LIMIT = '5mb';
