module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/testing/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/index.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'target/coverage',
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: '@wesib/wesib',
        outputDirectory: './target/test-results',
        classNameTemplate: '{classname}: {title}',
        titleTemplate: '{classname}: {title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: 'true',
      },
    ],
  ],
  restoreMocks: true,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.spec.json',
    },
  },
};
