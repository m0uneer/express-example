import { UserConfigOptions, AllowedCustomLoggers, DefaultStages } from '@djaty/djaty-nodejs';

const packageJsonFile = require(`${__dirname}/../../package.json`);

//noinspection JSUnusedGlobalSymbols
export const djatyConfig: UserConfigOptions = {
  showDjatyLogs: true,
  tags: ['ExpressExample'],
  stage: DefaultStages.PROD,
  allowAutoSubmission: true,
  release: packageJsonFile.version,
  trackingOptions: {
    allowedWrappers: {
      stdLogs: true,
      http: true,
      customLoggers: [{
        name: AllowedCustomLoggers.winston,
      }],
    },
  },
};
