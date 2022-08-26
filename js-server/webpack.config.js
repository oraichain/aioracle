const path = require('path');
const nodeExternals = require('webpack-node-externals')
const isProduction = true;
const mode = isProduction ? 'production' : 'development';
const devtool = isProduction ? false : 'inline-source-map';
module.exports = {
    entry: './index.js',
    target: 'node',
    mode,
    devtool,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,

            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build'),
        library: 'server',    // very important line
        libraryTarget: 'umd',    // very important line
        umdNamedDefine: true     // very important line
    },
    externals: [nodeExternals()], // skip bundle external libraries (node_modules)
    node: {
        __dirname: false,
        __filename: false,
    },
};