import { Err, Middleware, Next, Res } from '@tsed/common';
import { Exception } from 'ts-httpexceptions';
import { djaty } from '@djaty/djaty-nodejs';

import { Logger } from '../shared/services/logger/logger';
import { LoggerFactory } from '../shared/services/logger/loggerFactory';
import { ValidationError } from '../shared/services/validationError';

/**
 * Overriding the global error handling allows us to throw invalid form errors and handle them
 * correctly.
 */
@Middleware()
export class ErrorHandlerPrepareMiddleware {
  private logger: Logger;

  constructor(private loggerFactory: LoggerFactory) {
    this.logger = loggerFactory.getLogger(this.constructor.name);
  }

  async use(@Err() err: any, @Res() res: Res, @Next() next: Next) {
    this.logger.error(err);
    try {
      // Handle validation errors
      if (err instanceof ValidationError ||

        // Handle 4xx `ts-httpexceptions` errors that we through like NotFound and AccessDenied, ...
        err instanceof Exception) {

        // Set res.status to err.status & err.status to avoid triggering Djaty SDK if no status.
        err.status = err.status || (<any>err).statusCode || res.statusCode;

        res.status(err.status);
      } else {
        // Defaulting response status to avoid leaking the context of any other unexpected errors.
        res.status(500);
      }

      // To return whole error object (including `errors` property and others... ) in addition to
      // the message as it is immutable. Regarding `err.stack`, it should not appear in response.
      const errObj = Object.assign({}, err, { message: (<Error>err).message });

      if (res.statusCode >= 500) {
        res.end();

        return;
      }

      res.json(errObj);
    } catch (e) {
      await djaty.trackBug(e);
      throw e;
    }
  }
}
