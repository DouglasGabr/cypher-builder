/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  testEnvironment: 'node',
  clearMocks: true,
  testMatch: ['**/*.spec.ts'],
  setupFilesAfterEnv: ['jest-extended/all'],
  collectCoverageFrom: ['./src/**/*.ts'],
  transform: {
    '^.+\\.ts$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
          },
          target: 'es2019',
        },
        sourceMaps: 'inline',
      },
    ],
  },
};
module.exports = config;
