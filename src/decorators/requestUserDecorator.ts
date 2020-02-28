import { IFilter, Filter, ParseService, UseFilter } from '@tsed/common';

@Filter()
export class RequestUserFilter implements IFilter {
  constructor(private parseService: ParseService) {}

  transform(expression: string, request, response) {
    return this.parseService.eval(expression, request.session.user);
  }
}

/**
 * Returns the authenticated user (extracted from the request.user object).
 */
export function RequestUser(): Function {
  return UseFilter(RequestUserFilter);
}
