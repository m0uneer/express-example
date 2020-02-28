import { Inject, Injectable } from '@tsed/di';
import * as winston from 'winston';

import { winstonCustomFormat } from './winstonCustomFormat';
import { configSym } from '../../../config/config';
import { EnvConfig } from '../../../config/envConfig';

@Injectable()
export class LoggerFactory {
  constructor(@Inject(configSym) private config: EnvConfig) { }

  /**
   * Return "winston" logger instance where all it's logging methods are wrapped
   * To append label to any message passed to it
   *
   * @param loggerLabel
   */
  getLogger(loggerLabel?: string) {
    return winston.createLogger({
      ...this.config.logger,
      format: this.config.logger.format || winstonCustomFormat(loggerLabel),
    });
  }
}
