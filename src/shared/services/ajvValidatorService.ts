import * as Ajv from 'ajv';
import * as _ from 'lodash';
import { Inject, Injectable } from '@tsed/di';

import { Logger } from './logger/logger';
import { LoggerFactory } from './logger/loggerFactory';
import { ValidationError } from './validationError';
import { ERROR_MESSAGES } from '../../constants/errorMessages';
import { errorMessagesSym } from '../ioc';

// tslint:disable-next-line no-require-imports
const ajvMergePatch = require('ajv-merge-patch');

// tslint:disable-next-line no-require-imports
const ajvSwitchKeyword = require('ajv-keywords');

// tslint:disable-next-line no-require-imports
const ajvError = require('ajv-errors');

export interface Schemas {
  [name: string]: any;
}

export interface CustomKeywords {
  [name: string]: Ajv.KeywordDefinition;
}

export interface CustomFormats {
  [name: string]: Ajv.FormatValidator;
}

@Injectable()
export class AjvValidator {
  private ajv: Ajv.Ajv;
  private logger: Logger;

  constructor(private loggerFactory: LoggerFactory,
              @Inject(errorMessagesSym) private errorMessages: typeof ERROR_MESSAGES) {

    this.logger = loggerFactory.getLogger(this.constructor.name);

    const ajv = new Ajv(<any>{
      allErrors: true,
      useDefaults: true,
      jsonPointers: true,
      v5: true,
      $data: true,
    });

    ajvError(ajv);

    ajvMergePatch(ajv);
    ajvSwitchKeyword(ajv, 'switch');

    // tslint:disable-next-line max-line-length
    this.ajv = ajv;
  }

  /**
   * config
   *
   * @param schemas
   * @param customKeywords
   * @param customFormats
   */
  config(schemas: Schemas, customKeywords: CustomKeywords = {}, customFormats: CustomFormats = {}) {
    _.map(customKeywords, (keyword, keywordName: string) => {
      this.ajv.addKeyword(keywordName, keyword);
    });

    _.map(customFormats, (format, formatName: string) => {
      this.ajv.addFormat(formatName, format);
    });

    _.map(schemas, (schema, schemaName: string) => {
      schema.$schema = 'http://json-schema.org/draft-06/schema#';

      if (!schema.$async) {
        throw new Error(`Schema: ${schemaName} need to have "$async" property set to true ` +
                        'as we only accept async schemas');
      }

      schema.$id = `#${schemaName}`;

      this.ajv.addSchema(schema, schemaName);
    });
  }

  validate(schemaName: string, data: any) {
    const validateReturn = <Promise<any>> this.ajv.validate(schemaName, data);

    return validateReturn.catch((err: ValidationError) => {
      if (!err.errors || (err.errors && !err.errors.length)) {
        this.logger.error('Keywords validation error', { err });

        throw err;
      }

      throw new ValidationError(this.errorMessages.VALIDATION, err.errors);
    });
  }
}
