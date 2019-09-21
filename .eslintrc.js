module.exports = {
  parser: `@typescript-eslint/parser`,
  plugins: [`@typescript-eslint`],
  extends: [
    `plugin:@typescript-eslint/recommended`,
    `plugin:prettier/recommended`,
    `prettier/@typescript-eslint`,
  ],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: `module`,
  },
  rules: {
    "quotes": [`error`, `backtick`]
  },
}

