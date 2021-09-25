#!/usr/bin/env node
require("esbuild-register/dist/node").register();
module.exports = require("./build");
