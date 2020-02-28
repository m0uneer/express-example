import * as UUID from 'uuidjs';
import * as domain from 'domain';
import * as express from 'express';

export function getRequestIDLoggerMiddleware() {
  // Run the context for each request. Assign a unique identifier to each request
  return function(req: express.Request, res: express.Response, next: Function) {
    if ((<any> domain).active) {
      (<any> domain).active.__REQUEST_ID = UUID.genV1().toString();

      return next();
    }

    const activeDomain =  domain.create();
    (<any> activeDomain).__REQUEST_ID = UUID.genV1().toString();

    return activeDomain.run(next);
  };
}
