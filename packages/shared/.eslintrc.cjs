/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@xframes/eslint-config/react-internal.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
