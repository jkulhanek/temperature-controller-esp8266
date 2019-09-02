"use strict";
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CompressionPlugin = require('compression-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill', './src/index.js'],
    optimization: {
        minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
        splitChunks: {
            cacheGroups: {
              styles: {
                name: 'styles',
                test: /\.(css)$/,
                chunks: 'all',
                enforce: true,
              },
            },
        },
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.scss']
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            use: {
                loader: "babel-loader",
                options: {
                    presets: [
                        ['@babel/preset-env']
                    ]
                }
            }
        },
        {
            test: /\.(css|scss|sass)$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
        },
        {
            test: /\.xlsx$/i,
            use: 'arraybuffer-loader',
        },
        {
            loader: require.resolve('file-loader'),
            exclude: [/\.(js|mjs|jsx|ts|tsx|css|sass|scss|xlsx)$/, /\.html$/, /\.json$/],
            options: {
                name: "[sha512:hash:base64:7].[ext]",
            }
        }]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            inject: true,
            template: './public/index.html',
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
        })
    ],
    externals: {
        ExcelJS: 'ExcelJS',
    },
};