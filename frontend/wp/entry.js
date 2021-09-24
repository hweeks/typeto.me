/* eslint-disable import/no-extraneous-dependencies */
const webpack = require("webpack");
const Dev = require("webpack-dev-server");
const path = require("path");
const fs = require("fs-extra");
const rimraf = require("rimraf");

const config = require("./index");

const root = path.resolve(__dirname, "../");
const public_root = path.resolve(root, "./public");
const build_root = path.resolve(root, "./build");

function copy_public() {
  fs.copySync(public_root, build_root, {
    dereference: true,
  });
}

const is_prod = process.env.NODE_ENV === "production";

const start_up = async () => {
  const webpack_builder = webpack(config);
  if (is_prod) {
    rimraf.sync(build_root);
    copy_public();
      return webpack_builder.run((err) => {
        if (err) process.exit(1);
        process.exit(0);
      });
  } else {
    const server = new Dev(webpack_builder, config.devServer);
    server.start();
  }
};

start_up();
