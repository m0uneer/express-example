import { IMiddleware, Inject, Middleware, Req } from '@tsed/common';
import * as express from 'express';

import { PrivateAreaError } from '../shared/services/privateAreaError';
import { RequestUser } from '../decorators/requestUserDecorator';
import { UserPojo } from '../shared/models/UserPojo';
import { errorMessagesSym } from '../shared/ioc';
import { ERROR_MESSAGES } from '../constants/errorMessages';

/**
 * This authentication middleware validates the user session.
 */
@Middleware()
export class AuthMiddleware implements IMiddleware {
  constructor(@Inject(errorMessagesSym) private errorMessages: typeof ERROR_MESSAGES) {}

  async use(
    @Req() req: express.Request,
    @RequestUser() user: UserPojo,
  ) {
    // Always allow OPTIONS requests to pass
    if (req.method === 'OPTIONS' || AuthMiddleware.isPublicArea()) {
      return;
    }

    // Check if the request is not allowed
    if (!user) {
      throw new PrivateAreaError('Missing permissions!');
    }
  }

  private static isPublicArea() {
    // ...
  }
}
