export interface Logger {
  error(msg: string, obj?: object): void;
  warn(msg: string, obj?: object): void;
  info(msg: string, obj?: object): void;
  verbose(msg: string, obj?: object): void;
  debug(msg: string, obj?: object): void;
  silly(msg: string, obj?: object): void;
}
