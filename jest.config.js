module.exports = {
  preset: `ts-jest`,
  rootDir: `src`,
  coverageDirectory: `../coverage`,
  testEnvironment: `node`,
  collectCoverageFrom: [
    '**/*.{js,ts}',
    '!**/node_modules/**',
    '!*.testhelpers.{js,ts}',
  ],
}
