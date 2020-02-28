import { registerProvider } from '@tsed/di';
import * as IORedis from 'ioredis';
import * as sequelize from 'sequelize';

import { config } from '../config/config';
import { ERROR_MESSAGES } from '../constants/errorMessages';
import { AjvValidator } from './services/ajvValidatorService';

export const redisClientSym = Symbol('redisClient');

registerProvider({
  provide: redisClientSym,
  useValue: new IORedis(config.redis),
});

// ====================================================
export const errorMessagesSym = Symbol('errorMessages');

registerProvider({
  provide: errorMessagesSym,
  useValue: ERROR_MESSAGES,
});

// ====================================================
export const ajvValidatorSym = Symbol('ajvValidator');

registerProvider({
  provide: ajvValidatorSym,
  useValue: AjvValidator,
});

// ====================================================
export const sequelizeSym = Symbol('sequelize');

registerProvider({
  provide: sequelizeSym,
  useValue: AjvValidator,
});
