module.exports = {
  preset: `ts-jest`,
  rootDir: `src`,
  coverageDirectory: `../coverage`,
  testEnvironment: `node`,
  collectCoverageFrom: [
    '**/*.{js,ts}',
    '!**/node_modules/**',
    '!**/*.testhelpers.{js,ts}',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
    '!**/*.testhelpers.ts',
  ],
}
