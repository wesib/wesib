import { configureJest } from '@run-z/project-config';

export default await configureJest({
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/spec/**/*.ts',
    '!src/testing/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/index.ts',
    '!**/node_modules/**',
  ],
  restoreMocks: true,
  testEnvironment: 'jsdom',
});
