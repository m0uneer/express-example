import { ServerLoader, InjectorService } from '@tsed/common';

import { Server } from './server';
import { LoggerFactory } from './shared/services/logger/loggerFactory';

const injector = new InjectorService();
injector
  .load()
  .then(async () => {
    const logger = (<LoggerFactory>injector.get(LoggerFactory)).getLogger('ServerLoader');

    try {
      const server = await ServerLoader.bootstrap(Server);
      await server.listen();
      logger.debug('Server initialized');
    } catch (er) {
      logger.error(er);
    }
  });
