import { Injectable, Inject } from '@tsed/di';
import { BadRequest } from 'ts-httpexceptions';
import { AfterRoutesInit } from '@tsed/common';

import { EnvConfig } from '../../../config/envConfig';
import { TestCreation } from '../interfaces/testCreation';
import { configSym } from '../../../config/config';
import { schemas } from '../validation/testValidation';
import { ajvValidatorSym, errorMessagesSym } from '../../../shared/ioc';
import { ERROR_MESSAGES } from '../../../constants/errorMessages';
import { AjvValidator } from '../../../shared/services/ajvValidatorService';

@Injectable()
export class TestService implements AfterRoutesInit {
  private static SOME_CONSTANT = 24 * 60 * 60 * 1000;

  constructor(
    @Inject(configSym) private config: EnvConfig,
    @Inject(errorMessagesSym) private errorMessages: typeof ERROR_MESSAGES,
    @Inject(ajvValidatorSym) private ajvValidator: AjvValidator,
  ) {
  }

  $afterRoutesInit() {
    // init the validation here as the service is singleton but the ctrl is init with every request.
    this.ajvValidator.config(schemas);
  }

  async test(test: TestCreation) {
    if (TestService.SOME_CONSTANT === 0) {
      throw new BadRequest(this.errorMessages.THIS_IS_TEST_ERROR);
    }

    // await ...

    return { testProp: 'testString' };
  }
}
