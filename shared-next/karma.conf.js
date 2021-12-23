const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('deepmerge');

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = config => {
  const testFilesPath = 'test/gaia_elements/gaia_*.test.js';
  config.set(
    merge(createDefaultConfig(config), {
      files: [
        {
          pattern: !config.grep ? testFilesPath : config.grep,
          type: 'module'
        }
      ],
      esm: {
        nodeResolve: true,
        babel: true,
        coverageExclude: [testFilesPath]
      },
      coverageIstanbulReporter: {
        reports: ['html', 'lcovonly', 'text-summary'],
        dir: 'coverage-elements',
        combineBrowserReports: true,
        skipFilesWithNoCoverage: false,
        /*
         * ToDo: lower the thresholds to 30% for elements test
         *       now and will rise to 80% in future
         */
        thresholds: {
          emitWarning: false,
          global: {
            statements: 30,
            branches: 30,
            functions: 30,
            lines: 30
          }
        }
      }
    })
  );
  process.on('infrastructure_error', (error) => {
    console.error('infrastructure_error', error);
  });
  return config;
};
