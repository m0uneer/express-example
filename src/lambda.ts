import { InjectorService, LocalsContainer, ServerLoader } from '@tsed/common';
import * as AWSLambda from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';
import * as warmer from 'lambda-warmer';

import { Server } from './server';
import { LoggerFactory } from './shared/services/logger/loggerFactory';
import { Logger } from './shared/services/logger/logger';

let isServerReady = false;

// Cache server, injector, logger objects to reduce the time needed for the lambda cold start.
let server: ServerLoader;
let injector: LocalsContainer<any>;
let logger: Logger;

// The function handler to setup on AWS Lambda console -- the name of this function must match
// the one configured on AWS.
export const handler = async (event: AWSLambda.APIGatewayEvent, context: AWSLambda.Context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (!isServerReady) {
    injector = await new InjectorService().load();
    logger = (<LoggerFactory>injector.get(LoggerFactory)).getLogger('ServerLoader');
    server = await ServerLoader.bootstrap(Server);
    logger.debug('Server initialized');

    isServerReady = true;
  }

  // Using lambda-warmer to ping the lambda every configured interval to keep it 'warm'.
  if (await warmer(event, { correlationId: context.awsRequestId })) return 'warmed';

  const lambdaServer = awsServerlessExpress.createServer(server.expressApp);

  return awsServerlessExpress.proxy(lambdaServer, event, context, 'PROMISE').promise;
};
