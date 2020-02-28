import * as path from 'path';
import * as _ from 'lodash';
import { Env } from '@tsed/core';
import { registerProvider } from '@tsed/di';
import * as winston from 'winston';

import { EnvConfig } from './envConfig';
import { BASE_ROUTE } from '../constants/generalConstants';

export const allConfig: { [prop: string]: EnvConfig } = {
  development: {
    baseRoute: BASE_ROUTE,
    mySQLConfig: {
      database: 'express_example_development',
      dialect: 'mysql',
      host: 'localhost',
      password: '',
      username: '',
      operatorsAliases: false,
    },
    redis: {
      host: 'localhost',
      port: 6379,
    },
    logger: {
      exitOnError: false,
      transports: [
        new (winston.transports.Console)({
          level: 'silly',
          handleExceptions: false,
        }),
      ],
    },
  },

  production: {
    baseRoute: BASE_ROUTE,
    mySQLConfig: {
      database: 'express_example_production',
      dialect: 'mysql',
      host: 'localhost',
      password: '',
      username: '',
      operatorsAliases: false,
    },
    redis: {
      host: 'localhost',
      port: 6379,
    },
    logger: {
      exitOnError: false,
      transports: [
        new (winston.transports.Console)({
          level: 'info',
          handleExceptions: false,
        }),
        new (winston.transports.File)({
          filename: path.resolve(__dirname, '../../logs/server.log'),
          level: 'info',
          handleExceptions: false,
          maxsize: 5 * 1024 * 1024, // 5MB
          maxFiles: 10,
        }),
      ],
    },
  },

  test: {
    baseRoute: BASE_ROUTE,
    mySQLConfig: {
      database: 'express_example_test',
      dialect: 'mysql',
      host: 'localhost',
      password: '',
      username: '',
      operatorsAliases: false,
    },
    redis: {
      host: 'localhost',
      port: 6379,
    },
    logger: {
      exitOnError: false,
      transports: [
        new (winston.transports.Console)({
          level: 'debug',
          handleExceptions: false,
        }),
        new (winston.transports.File)({
          filename: path.resolve(__dirname, '../../logs/server.log'),
          level: 'debug',
          handleExceptions: false,
          maxsize: 5 * 1024 * 1024, // 5MB
          maxFiles: 10,
        }),
      ],
    },
  },
};

const currEnv = (<Env.DEV>process.env.NODE_ENV) || Env.DEV;
if (!_.has(allConfig, currEnv)) {
  throw new Error('Wrong value of environment variable');
}

export const config = allConfig[currEnv];

export const configSym = Symbol('config');

registerProvider({
  provide: configSym,
  useValue: config,
});
