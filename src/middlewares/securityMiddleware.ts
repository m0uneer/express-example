import { NextFunction as ExpressNext, Response as ExpressResponse,
         Request as ExpressRequest } from 'express';
import { Req, Middleware, Next, Res, IMiddleware } from '@tsed/common';
import * as lusca from 'lusca';
import { isString } from 'util';

/**
 * Web application security middleware.
 */
@Middleware()
export class SecurityMiddleware implements IMiddleware {

  // noinspection JSMethodCanBeStatic
  /**
   * @param res
   * @param req
   * @param next
   */
  use(@Req() req: ExpressRequest,
      @Res() res: ExpressResponse,
      @Next() next: ExpressNext) {

    // Default `Content-Type` for `res.send()` is `text/html` so we need to reset it
    res.set('Content-Type', 'application/json');
    res.json = (data: any) => {
      if (typeof data !== 'object' ) {
        return res.send(data);
      }

      // Passing a replacer fn to the `JSON.stringify` to allow escaping html bad chars that
      // may cause XSS attacks. By default all responses will be escaped.
      // Using this technique is more efficient than any alternative as we depend on the same
      // `res.json` that stringify the response.
      let strData = JSON.stringify(data, (key: string, val: any) => {
        if (!isString(val)) {
          return val;
        }

        return escape(val);
      });

      // Handle JSON vulnerability by to protect against JSON/JSONP attacks.
      strData = `)]}',\n${strData}`;

      return res.send(strData);
    };

    const csrfName = 'XSRF-TOKEN';

    // Workaround to let support fetching CSRF token from the cookies.
    req.body['_csrf'] = req.cookies[csrfName];

    lusca({
      csrf: {
        angular: true,
      },
    })(req, res, (err) => {
      if (err) {
        next(err);

        return;
      }

      // Set it into header for Angular
      res.setHeader('xsrf-token', res.locals._csrf);
      delete req.body._csrf;

      next();
    });
  }
}
