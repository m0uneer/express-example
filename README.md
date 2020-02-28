Express Example
===

## Features
- Using Typescript
- Using TS.ed. It is a Node.js and TypeScript framework on top of Express to write the application with TypeScript (or ES6)
  It provides a lot of decorators and guidelines to make the code more readable and less error-prone
- Custom Logger to allow logging
- Using JS object based config files for more flexibility
- Using Djaty for bug tracking
- Using Redis as a session store for production scaling support
- Using winston as a custom logger
- Applying AirBnB Style guide 
- Code based error messages
- Custom error handling
- Creating a security middleware
- Modularity structure
- JSON based request validation using AJV
- Using domains in combination with our logger to log all the request logs with a unique ID
- Exposing Health Checks endpoint and supporting Graceful Shutdown
- Supporting AWS CodeBuild
- Supporting AWS Serverless Application Model (SAM) framework for building the serverless Lambda
- Using `semantic-release` for semantic versioning and generation changelog
- Using `commitlint` and `husky` to force Angular conventional commit format and linting staged files
- Allowing CORS

## Requirements
- NodeJS > v10.18

## Config
- Copy file `src/config/config.default.ts` to `src/config/config.ts` and set needed config.
- Copy file `src/config/djatyConfig.default.ts` to `src/config/djatyConfig.ts` and set needed config.

## Database
- Install MySQL

## Install dependencies
- `$ npm i`

## Run the app
- `$ npm run build && npm run start`
- `$ npm run start:ts-node`
- `$ npm run inspect`
- `$ npm run inspect-brk`

## Run test
- `$ npm run test`

## TODOs
- Every module should have its own `ERROR_MESSAGES` object.
- Create an example sequelize model.
- Create testing example.
- Create a logger decorator.
- Replacing the Domain with `async-hook-domain`
- Using Swagger
- Configuring `djaty` based on the env.
