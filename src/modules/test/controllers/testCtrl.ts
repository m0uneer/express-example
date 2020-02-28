import { BadRequest } from 'ts-httpexceptions';
import { BodyParams, Controller, Get, MergeParams, PathParams, Post } from '@tsed/common';
import { Inject } from '@tsed/di';

import { TestService } from '../services/testService';
import { RequestUser } from '../../../decorators/requestUserDecorator';
import { TestCreation } from '../interfaces/testCreation';
import { TEST_CREATION_SCHEMA } from '../constants/testConstants';
import { ERROR_MESSAGES } from '../../../constants/errorMessages';
import { AjvValidator } from '../../../shared/services/ajvValidatorService';
import { ajvValidatorSym, errorMessagesSym } from '../../../shared/ioc';
import { UserPojo } from '../../../shared/models/UserPojo';

@MergeParams(true)
@Controller('/example')
export class TestCtrl {
  constructor(
    private testService: TestService,
    @Inject(ajvValidatorSym) private ajvValidatorWrapper: AjvValidator,
    @Inject(errorMessagesSym) private errorMessages: typeof ERROR_MESSAGES,
  ) { }

  @Get('/success-test')
  test(@PathParams('test') namespace: string) {
    return { namespace };
  }

  @Get('/error-test')
  errorTest() {
    throw new BadRequest(this.errorMessages.THIS_IS_TEST_ERROR);
  }

  @Post('/test-endpoint')
  async createTest(@RequestUser() user: UserPojo,
                   @BodyParams() body: TestCreation) {

    const testVal: TestCreation = await this.ajvValidatorWrapper
      .validate(TEST_CREATION_SCHEMA, body);

    // some logic with the valid body data
    await this.testService.test(testVal);

    return { data: 'test' };
  }
}
