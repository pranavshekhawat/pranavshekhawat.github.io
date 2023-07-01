const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

module.exports = {
    mode: 'development',
    entry: {
        app: './src/index.js',
    },
    // devtool: 'inline-source-map',
    // devServer: {
    //     contentBase: './dist',
    // },
    plugins: [
        // new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
        new HtmlWebpackPlugin({
            title: 'Development',
        }),
        new WebpackManifestPlugin(),
    ],
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        clean : true,
        // publicPath: '/',
        // assetModuleFilename: 'images/[hash][ext][query]',
    },
    // module: {
    //     rules: [
    //         {
    //             test: /\.css$/i,
    //             use: ['style-loader', 'css-loader'],
    //             // use: ['style-loader', 'css-loader?url=false'],
    //         },
    //         {
    //             test: /\.(png|svg|jpg|jpeg|gif)$/i,
    //             type: 'asset/resource',
    //             // type: 'asset/inline',
    //             // type: 'asset',
    //             // parser: {
    //             //     dataUrlCondition: {
    //             //         maxSize: 4 * 1024, // 4kb
    //             //     },
    //             // },
    //         },
    //         {
    //             test: /\.(woff|woff2|eot|ttf|otf)$/i,
    //             type: 'asset/resource',
    //             // type: 'asset/inline',
    //             // type: 'asset',
    //         },
    //         {
    //             test: /\.(csv|tsv)$/i,
    //             use: ['csv-loader'],
    //         },
    //         {
    //             test: /\.xml$/i,
    //             use: ['xml-loader'],
    //         },
    //     ],
    // },
};