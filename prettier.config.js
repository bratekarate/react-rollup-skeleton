module.exports = {
  parser: "typescript",
  printWidth: 79,
  tabWidth: 2,
  overrides: [
    {
      files: "*.json",
      options: { parser: "json" },
    },
  ],
};
