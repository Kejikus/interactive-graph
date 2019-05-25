import path from 'path';
import webpack from 'webpack';


export default {
    entry: {
        index: './dev/js/index.jsx',
        main: './dev/js/main.jsx'
    },
    output: {
        path: `${__dirname}/app`,
        filename: '[name].js',
        library: '[name]'
    },
    target: 'electron-renderer',
    devtool: 'source-map',

    mode: 'development',

    resolve: {
        extensions: ['.js', '.jsx', ".sass", '.scss'],
        modules: [
            'node_modules'
        ]
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve(__dirname, "dev")
                ],
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['latest', 'stage-0', 'react'],
                        plugins: ['transform-runtime']
                    }
                },
            },
            {
                test: /\.txt/,
                use: {
                    loader: 'raw-loader'
                }
            },
            {
                test: /\.s[a|c]ss$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            includePaths: [
                                path.resolve(__dirname, "./dev/styles"),
                                path.resolve(__dirname, "./node_modules/materialize-css/sass")
                            ]
                        }
                    }
                ],
            }
        ]
    },
}