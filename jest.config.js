/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  clearMocks: true,
  testMatch: ['**/*.spec.ts'],
  setupFilesAfterEnv: ['jest-extended'],
  collectCoverageFrom: ['./src/**/*.ts'],
};
module.exports = config;
