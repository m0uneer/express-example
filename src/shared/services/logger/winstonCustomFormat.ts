import * as winston from 'winston';
import * as _ from 'lodash';
import { SPLAT, MESSAGE } from 'triple-beam';
import * as util from 'util';

const { combine, colorize: winstonColorize, printf, timestamp, label } = winston.format;

export function winstonCustomFormat(logLabel?: string): ReturnType<typeof winston.format.combine> {
  function formatObject(param: any) {
    if (_.isObject(param)) {
      return util.inspect(param);
    }

    return param;
  }

  const prepareMessage = winston.format((info) => {
    const splat = info[SPLAT] || [];
    const message = formatObject(info.message);
    const rest = splat.map(formatObject).join(' ');
    info.message = `${message} ${rest}`;

    return info;
  });

  const formatMessage = ({ timestamp: msgTimestamp, label: msgLabel, level, message }: any) => {
    const reqId = process.domain ? (<any> process.domain).__REQUEST_ID : undefined;

    return `[${msgTimestamp}][${msgLabel || 'Logger'}][${level}]: ${formatObject(message)}` +
      (reqId ? ` - RequestId: ${reqId}` : '');
  };

  function prodFormat() {
    const replaceErr = (info: any) => ({
      message: formatMessage(info),
      stack: info.stack,
    });

    const replaceObj = (info: any) => ({
      message: formatMessage(info),
    });

    const replacer = (key: any, value: any) =>
      value instanceof Error ? replaceErr(value) : _.isObject(value) ? replaceObj(value) : value;

    const safeStringify = winston.format((info) => {
      const safeInfo = Object.assign({}, info, { toJSON: undefined });
      info[MESSAGE] = JSON.stringify(safeInfo, replacer);

      return info;
    });

    // noinspection JSUnusedGlobalSymbols
    return combine(
      prepareMessage(),
      label({ label: logLabel }),
      timestamp({ format: 'YY-MM-DD HH:mm:SS' }),
      safeStringify(),
    );
  }

  function devFormat() {
    // `colorizer`: `combine(winstonColorize({all: true}), ...)` not working with `timestamp()`.
    const { colorize } = winstonColorize();

    const formatColorizedMessage = (info: any) => colorize(info.level, formatMessage(info));

    const formatError = (info: any) => colorize(info.level,
      `${formatColorizedMessage(info)}\n${info.stack}\n`);

    const format = (info: any) =>
      info instanceof Error ? formatError(info) : formatColorizedMessage(info);

    return combine(
      prepareMessage(),
      label({ label: logLabel }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:SS' }),
      printf(format),
    );
  }

  const nodeEnv = process.env.NODE_ENV;
  const isDev = !nodeEnv || nodeEnv === 'development';

  return isDev ? devFormat() : prodFormat();
}
