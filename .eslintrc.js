module.exports = {
  root: true,
  // This tells ESLint to load the config from the package `eslint-config-custom`
  extends: ["custom"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
};
