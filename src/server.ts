import { djaty } from '@djaty/djaty-nodejs';
import { djatyConfig } from './config/djatyConfig';
djaty.init(djatyConfig);

import { Request, Response, NextFunction } from 'express';
import '@djaty/djaty-nodejs/dist/wrappers/expressRouterWrapper';

import { GlobalAcceptMimesMiddleware, InjectorService, ServerLoader,
         ServerSettings } from '@tsed/common';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as awsServerlessExpressMiddleware from 'aws-serverless-express/middleware';

import { ErrorHandlerPrepareMiddleware } from './middlewares/errorHandlerPrepareMiddleware';
import { SecurityMiddleware } from './middlewares/securityMiddleware';
import { AuthMiddleware } from './middlewares/authMiddleware';
import { InstanceStatusService } from './shared/services/instanceStatusService';
import { EnvConfig } from './config/envConfig';
import { config as appConfig, configSym } from './config/config';
import { TestCtrl } from './modules/test/controllers/testCtrl';
import { Logger } from './shared/services/logger/logger';
import { LoggerFactory } from './shared/services/logger/loggerFactory';
import { getRequestIDLoggerMiddleware } from './shared/services/logger/requestIDLoggerMiddleware';
import { BODY_PARSER_LIMIT, sessionConfig } from './config/generalConfigs';

// tslint:disable-next-line:no-require-imports
const bodyParser = require('body-parser');

// tslint:disable-next-line no-require-imports
const expWinston = require('express-winston');

const rootDir = __dirname;

@ServerSettings({
  rootDir,
  acceptMimes: ['application/json'],
  mount: {
    [appConfig.baseRoute]: [TestCtrl],
  },
  componentsScan: [
    `${rootDir}/**/middlewares/**/**.js`,
    `${rootDir}/**/services/**/**.js`,
  ],
})
export class Server extends ServerLoader {
  // noinspection JSUnusedGlobalSymbols
  /**
   * This method let you configure the express middleware required by your application to works.
   * @returns {Server}
   */
  async $beforeRoutesInit(): Promise<any> {
    const injector = await new InjectorService().load();
    const config: EnvConfig = injector.get(configSym);
    const logger = (<LoggerFactory>injector.get(LoggerFactory)).getLogger('ExpressWinston');
    const expressWinston: Logger = expWinston.logger({ winstonInstance: logger });
    const instanceStatusService: InstanceStatusService = injector.get(InstanceStatusService);

    // First middleware to be used should be `djaty.requestHandler()`
    this
      .use(djaty.requestHandler())
      .use(getRequestIDLoggerMiddleware())
      .use(cookieParser())
      .use(GlobalAcceptMimesMiddleware)
      .use(session(sessionConfig))
      .use(bodyParser.json({
        limit: BODY_PARSER_LIMIT,
      }))

      .use(bodyParser.urlencoded({
        extended: true,
      }))

      .use(SecurityMiddleware)
      .use((req: Request, res: Response, next: NextFunction) => {
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
        res.header('Access-Control-Allow-Headers',
          'Content-Type, Authorization, Content-Length, X-Requested-With');

        next();
      })
      .use(expressWinston)
      .use(awsServerlessExpressMiddleware.eventContext())

      // Global validation and authentication
      .use(config.baseRoute, AuthMiddleware);

    await instanceStatusService.init(this.httpServer);
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Called after routes has been mounted.
   */
  $afterRoutesInit(): void {
    this.use(ErrorHandlerPrepareMiddleware);

    // Last middleware to be used should be `djaty.errorHandler()`
    this.expressApp.use(djaty.errorHandler());
  }
}
