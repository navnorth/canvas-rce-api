"use strict";
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env")
});
// unsplash-js requires fetch to be available in the global scope
// see: https://github.com/unsplash/unsplash-js#adding-polyfills
global.fetch = require("node-fetch");

const container = require("./app/container");
const _application = require("./app/application");

module.exports = container.make(_application).listen();
