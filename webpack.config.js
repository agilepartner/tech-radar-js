"use strict";

const path = require("path");
const buildPath = path.join(__dirname, "./dist");
const args = require("yargs").argv;
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

let outputPath = "_build";

let main = ["./src/site.js"];
let common = ["./src/common.js"];
let devtool;
let pathsToClean = [outputPath];
let isDev = args.dev;

if (isDev) {
  main.push("webpack-dev-server/client?http://0.0.0.0:8080");
  devtool = "source-map";
}

let plugins = [
  new ExtractTextPlugin("[name].[hash].css"),
  new HtmlWebpackPlugin({
    template: "./src/index.html",
    chunks: ["main"],
    inject: "body",
    minify: false
  }),
  new CleanWebpackPlugin(pathsToClean)
];

module.exports = {
  entry: {
    main: main,
    common: common
  },
  node: {
    fs: "empty",
    net: "empty",
    tls: "empty",
    child_process: "empty"
  },
  output: {
    path: outputPath,
    filename: "[name].[hash].js"
  },

  module: {
    loaders: [
      { test: /\.json$/, loader: "json" },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract("style", "css?sourceMap!sass")
      },
      {
        test: /\.(png|jpg|ico)$/,
        exclude: /node_modules/,
        loader: "file-loader?name=images/[name].[ext]&context=./src/images"
      }
    ]
  },

  quiet: false,
  noInfo: false,
  plugins: plugins,
  devtool: devtool,

  devServer: {
    contentBase: buildPath,
    host: "0.0.0.0",
    port: 8080
  }
};
