module.exports = {
  presets: [
    "@babel/preset-react",
    "@babel/preset-typescript",
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ["ie >= 11", "Firefox >= 68", "Chrome >= 41"],
          // Firefox ESR 60 is supported until October 2019
          // for the moment we need Chrome 41, so that it is crawlable by the googlebot web rendering service, see
          // https://developers.google.com/search/docs/guides/rendering
          // https://www.elephate.com/blog/google-improve-web-rendering-service/
        },
      },
    ],
  ],
  plugins: [
    "@babel/plugin-syntax-import-meta",
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-transform-arrow-functions",
    "@babel/plugin-proposal-optional-chaining",
  ],
};
