import * as http from 'http';
import { createTerminus } from '@godaddy/terminus';
import * as sequelize from 'sequelize';
import { Injectable, Inject } from '@tsed/di';
import * as IORedis from 'ioredis';

import { redisClientSym, sequelizeSym } from '../ioc';
import { LoggerFactory } from './logger/loggerFactory';
import { Logger } from './logger/logger';

/**
 * This file adds Health Checks and Graceful Shutdown support:
 *
 * When deploying a new version of the application, first a SIGTERM signal will be sent
 * to the application to notify it that it will be killed. Once the application gets this signal,
 * it will stop accepting new requests, finish all the ongoing requests, and clean up the resources
 * it used, including database connections and file locks. This will let our resources to save
 * their states properly and to avoid any data corruption.
 */
@Injectable()
export class InstanceStatusService {
  private readonly logger: Logger;

  /**
   * Usually, we do not create instances of this class leaving this for the dependency injection.
   *
   * @param loggerFactory
   * @param sequelizeConn
   * @param redisClient
   */
  constructor(private readonly loggerFactory: LoggerFactory,
              @Inject(sequelizeSym) private readonly sequelizeConn: sequelize.Sequelize,
              @Inject(redisClientSym)  private readonly redisClient: IORedis.Redis) {

    this.logger = loggerFactory.getLogger(this.constructor.name);
  }

  async init(server: http.Server) {
    const options = {
      // healtcheck options
      healthChecks: {
        // a promise returning function indicating service health
        '/api/healthCheck': this.healthCheck.bind(this),
      },

      // cleanup options
      // [optional = 1000] number of milliseconds before forcefull exiting
      timeout: 1000,

      signal: 'SIGTERM',
      signals: ['SIGINT'],

      // [optional] cleanup function, returning a promise (used to be onSigterm)
      onSignal: this.onSignal.bind(this),

      // [optional] called right before exiting
      onShutdown: this.onShutdown.bind(this),

      // [optional] logger function to be called with errors
      logger: this.logger.error.bind(this.logger),
    };

    createTerminus(server, options);
  }

  private async onSignal () {
    this.logger.info('server is starting cleanup');

    // your clean logic, like closing database connections
    return Promise.all([
      this.sequelizeConn.close(),
      this.redisClient.quit(),
    ]);
  }

  private async onShutdown () {
    this.logger.info('cleanup finished, server is shutting down');
  }

  private async healthCheck () {
    // Check our resources
    this.logger.info('Health Check is running...');

    await Promise.all([
      this.sequelizeConn.authenticate(),
      this.redisClient.ping(),
    ]);

    this.logger.info('Server status is OK');

    // optionally include a resolve value to be included as info in the healthcheck response.
    return;
  }
}
