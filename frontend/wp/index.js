/* eslint-disable import/no-extraneous-dependencies */
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PnpWebpackPlugin = require("pnp-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const webpack = require("webpack");
const path = require("path");
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");
const { ESBuildMinifyPlugin } = require("esbuild-loader");

const root = path.resolve(__dirname, "../");
const src = path.resolve(root, "./src");
const public_root = path.resolve(root, "./public");
const build_root = path.resolve(root, "./build");

const css_regex = /\.css$/;
const css_module_regex = /\.module\.css$/;
const is_dev = process.env.NODE_ENV !== "production";
const is_prod = !is_dev;
const use_sourcemap = is_dev;
const img_size_limit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || "10000",
  10
);

const style_loaders = (cssOptions, preProcessor) => {
  const loaders = [
    is_dev && require.resolve("style-loader"),
    is_prod && {
      loader: MiniCssExtractPlugin.loader,
      options: {},
    },
    {
      loader: require.resolve("css-loader"),
      options: cssOptions,
    },
  ].filter(Boolean);
  if (preProcessor) {
    loaders.push(
      {
        loader: require.resolve("resolve-url-loader"),
        options: {
          sourceMap: is_prod && use_sourcemap,
        },
      },
      {
        loader: require.resolve(preProcessor),
        options: {
          sourceMap: true,
        },
      }
    );
  }
  return loaders;
};

const REACT_APP = /^REACT_APP_/i;

function env_to_string() {
  const raw = Object.keys(process.env)
    .filter((key) => REACT_APP.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        NODE_ENV: process.env.NODE_ENV || "development",
        WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
        WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
        WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
      }
    );
  const stringified = {
    "process.env": Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };
  return { raw, stringified };
}

const env = env_to_string();

const get_plugins = () =>
  [
    new HtmlWebpackPlugin({
      title: "typeto.me",
      template: path.resolve(public_root, "./index-template.html"),
      publicPath: '/',
      environment: process.env.NODE_ENV,
    }),
    new webpack.DefinePlugin({
      ...env.stringified,
    }),
    is_dev && new webpack.HotModuleReplacementPlugin(),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new ManifestPlugin({
      fileName: "asset-manifest.json",
      publicPath: '/',
      generate: (seed, files, entrypoints) => {
        const manifestFiles = files.reduce((manifest, file) => {
          manifest[file.name] = file.path;
          return manifest;
        }, seed);
        const entrypointFiles = entrypoints.main.filter(
          (fileName) => !fileName.endsWith(".map")
        );

        return {
          files: manifestFiles,
          entrypoints: entrypointFiles,
        };
      },
    }),
    is_prod &&
      new MiniCssExtractPlugin({
        filename: "static/css/[name].[contenthash:8].css",
        chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
      }),
  ].filter(Boolean);

const get_modules = () => ({
  strictExportPresence: true,
  rules: [
    { parser: { requireEnsure: false } },
    {
      oneOf: [
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          loader: require.resolve("url-loader"),
          options: {
            limit: img_size_limit,
            name: "static/media/[name].[hash:8].[ext]",
          },
        },
        {
          test: /\.(js|mjs|jsx)$/,
          include: src,
          loader: require.resolve("esbuild-loader"),
          options: {
            loader: "jsx",
            target: "es2018",
          },
        },
        {
          test: /\.(ts|tsx)$/,
          include: src,
          loader: require.resolve("esbuild-loader"),
          options: {
            loader: "tsx",
            target: "es2018",
          },
        },
        {
          test: css_regex,
          exclude: css_module_regex,
          use: style_loaders({
            importLoaders: 1,
            sourceMap: is_prod && use_sourcemap,
          }),
          sideEffects: true,
        },
        {
          test: css_module_regex,
          use: style_loaders({
            importLoaders: 1,
            sourceMap: is_prod && use_sourcemap,
            modules: {
              getLocalIdent: getCSSModuleLocalIdent,
            },
          }),
        },
        {
          loader: require.resolve("file-loader"),
          exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
          options: {
            name: "static/media/[name].[hash:8].[ext]",
          },
        },
      ],
    },
  ],
});

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: {
    main: path.resolve(src, "./index.tsx"),
  },
  devtool: "inline-source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    plugins: [PnpWebpackPlugin],
    modules: ["node_modules"],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
  output: {
    path: build_root,
    filename: "[name].bundle.js",
    publicPath: '/',
    jsonpFunction: `webpackJsonp-core-ui`,
    globalObject: "this",
    devtoolModuleFilenameTemplate: is_prod
      ? (info) =>
          path.relative(src, info.absoluteResourcePath).replace(/\\/g, "/")
      : is_dev &&
        ((info) => path.resolve(info.absoluteResourcePath).replace(/\\/g, "/")),
  },
  performance: {
    hints: "warning",
  },
  module: get_modules(),
  devServer: {
    port: 3000,
    host: "0.0.0.0",
    contentBase: public_root,
    publicPath: "/",
    filename: "[name].bundle.js",
    historyApiFallback: true,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
    },
    proxy: {
      "/api/**": {
        target: "http://localhost:4000/",
        changeOrigin: true,
      },
    },
  },
  plugins: get_plugins(),
  optimization: {
    minimize: is_prod,
    minimizer: [
      new ESBuildMinifyPlugin({
        target: "es2015",
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: use_sourcemap
            ? {
                inline: false,
                annotation: true,
              }
            : false,
        },
        cssProcessorPluginOptions: {
          preset: ["default", { minifyFontValues: { removeQuotes: false } }],
        },
      }),
    ],
    splitChunks: {
      chunks: "all",
      name: false,
    },
    runtimeChunk: {
      name: (entrypoint) => `runtime-${entrypoint.name}`,
    },
  },
  node: {
    module: "empty",
    dgram: "empty",
    dns: "mock",
    fs: "empty",
    http2: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty",
  },
};
