import { TestCreation } from '../interfaces/testCreation';
import { Schemas } from '../../../shared/services/ajvValidatorService';

export const schemas: Schemas = {
  testCreation: <{properties: Record<keyof TestCreation, any>}> {
    title: 'Test Creation Endpoint',
    description: 'Test creation endpoint desc',
    type: 'object',
    additionalProperties: false,
    $async: true,
    properties: {
      x: {
        type: 'string',
      },
      y: {
        type: 'string',
        maxLength: 3000,
      },
      z: {
        type: 'string',
      },
      a: {
        type: 'string',
      },
    },

    // this errorMessage prop is optional
    errorMessage: {
      properties: {
        x: 'Invalid value of x',
      },
    },
    required: ['x', 'z'],
  },
};
