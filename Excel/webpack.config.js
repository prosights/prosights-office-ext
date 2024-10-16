/* eslint-disable no-undef */

const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

const urlLocal = "https://localhost:3000/";
const urlDev = "https://dev-msoffice.prosights.co/";
const urlProd = "https://msoffice.prosights.co/"; // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

module.exports = async (env, options) => {
  const mode = options.mode || "local";
  const config = {
    devtool: "source-map",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      vendor: ["react", "react-dom", "core-js", "@fluentui/react-components", "@fluentui/react-icons"],
      taskpane: ["./src/taskpane/index.tsx", "./src/taskpane/taskpane.html"],
      commands: "./src/commands/commands.ts",
      extractImage: ["./src/extract-image/extractImage.tsx", "./src/extract-image/extractImage.html"],
    },
    output: {
      clean: true,
    },
    resolve: {
      extensions: [".ts", ".tsx", ".html", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-typescript"],
            },
          },
        },
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: ["ts-loader"],
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader",
        },
        {
          test: /\.(png|jpg|jpeg|ttf|woff|woff2|gif|ico)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext][query]",
          },
        },
      ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "assets/*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "manifest*.xml",
            to: "[name]" + "[ext]",
            // Depending on the mode, replace the local URL in the manifest with the appropriate URL
            transform(content) {
              if (mode === "local") {
                return content.toString().replace(new RegExp(urlLocal, "g"), urlDev);
              } else if (mode === "dev") {
                return content.toString().replace(new RegExp(urlLocal, "g"), urlDev);
              } else {
                return content.toString().replace(new RegExp(urlLocal, "g"), urlProd);
              }
            },
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["polyfill", "vendor", "taskpane", "commands", "functions"],
      }),
      new HtmlWebpackPlugin({
        filename: "dialogRedirect.html",
        template: "./src/login/dialogRedirect.html",
        chunks: ["dialogRedirect"],
      }),
      new HtmlWebpackPlugin({
        filename: "extractImage.html",
        template: "./src/extract-image/extractImage.html",
        chunks: ["polyfill", "vendor", "extractImage"],
      }),
      new HtmlWebpackPlugin({
        filename: "settingsDialog.html",
        template: "./src/settings/settingsDialog.html",
        chunks: ["polyfill", "vendor", "settingsDialog"],
      }),
      new webpack.ProvidePlugin({
        Promise: ["es6-promise", "Promise"],
      }),
    ],
    devServer: {
      hot: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      server: {
        type: "https",
        options: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions(),
      },
      port: process.env.npm_package_config_dev_server_port || 3000,
    },
  };

  return config;
};
