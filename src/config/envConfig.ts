import { LoggerOptions } from 'winston';
import * as sequelize from 'sequelize';
import * as IORedis from 'ioredis';

export interface EnvConfig {
  baseRoute: string;
  mySQLConfig: sequelize.Options;
  logger: LoggerOptions;
  redis: IORedis.RedisOptions;
}
