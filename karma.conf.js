let browser = 'Chrome';

if (!process.env.CHROME_BIN || process.env.CHROME_BIN === 'puppeteer') {
  process.env.CHROME_BIN = require('puppeteer').executablePath();
  browser = 'Puppeteer';
}

module.exports = (config) => {
  config.set({
    frameworks: [
      'jasmine',
      'karma-typescript',
    ],
    plugins: [
      require('karma-chrome-launcher'),
      require('karma-jasmine'),
      require('karma-jasmine-html-reporter'),
      require('karma-typescript'),
    ],
    files: [
      { pattern: 'node_modules/tslib/tslib.js', watched: false },
      { pattern: 'src/**/!(index).ts' },
    ],
    preprocessors: {
      'src/**/*.ts': ['karma-typescript'],
    },
    reporters: [
      'progress',
      'kjhtml',
      'karma-typescript',
    ],
    karmaTypescriptConfig: {
      typescript: require('typescript'),
      include: {
        mode: 'replace',
        values: [
          'src/**/*.ts',
        ],
      },
      exclude: [
        '**/index.ts',
      ],
      bundlerOptions: {
        entrypoints: /\.spec\.ts$/,
      },
      compilerOptions: {
        'moduleResolution': 'node',
        'target': 'es5',
        'strict': true,
        'noFallthroughCasesInSwitch': true,
        'forceConsistentCasingInFileNames': false,
        'experimentalDecorators': true,
        'lib': [
          'dom',
          'es6',
        ],
        'sourceMap': true,
        'newLine': 'LF'
      },
      coverageOptions: {
        // Exclude tests and index files.
        exclude: /(\.spec|[\\\/]index)\.ts$/,
        /*threshold: {
          global: {
            statements: 90,
            branches: 90,
            functions: 90,
            lines: 90,
          },
          file: {
            statements: 90,
            branches: 90,
            functions: 90,
            lines: 90,
          }
        },*/
      },
      reports: {
        'html': 'target/coverage',
        'text-summary': null,
      }
    },
    customLaunchers: {
      Puppeteer: {
        base: 'ChromeHeadless',
        flags: ['--disable-translate', '--disable-extensions', '--no-sandbox']
      }
    },
    browsers: [browser],
  });
};
