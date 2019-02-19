const { graphql } = require('graphql');
const axios = require('axios');
const executableSchema = require('../../graphql/Schema');
const testGetTemplate = require('./test-cases/template/GetTemplate');
const testTemplatesHasImageFirmware = require('./test-cases/template/TemplatesHasImageFirmware');

jest.mock('axios');

afterEach(() => {
  axios.mockReset();
});

describe('Schema', () => {
  // Array of case types
  const cases = [testGetTemplate, testTemplatesHasImageFirmware];

  cases.forEach(async (obj) => {
    const {
      id, query, variables, context, expected,
    } = obj;

    test(`query: ${id}`, async () => {
      await obj.beforeTest();
      const result = await graphql(executableSchema, query, null, context, variables);
      return expect(result).toEqual(expected);
    });
  });
});
