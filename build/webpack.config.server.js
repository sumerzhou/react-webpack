const path = require('path');
const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const baseConfig = require('./webpack.base');

module.exports = webpackMerge(baseConfig,{
    target:'node',  //指明这个js打包出来的内容是使用在哪个执行环境中的,可以是web、node或其他
    entry:{
        app:path.join(__dirname,'../client/server.entry.js')
    },
    externals:Object.keys(require('../package.json').dependencies),
    output:{
        filename:'server.entry.js',
        libraryTarget:'commonjs2'   //打包出来的js使用的模块方案，比方umd,cmd,commonjs等
    },
    plugins: [
        new webpack.DefinePlugin({ //定义一些变量，让它可以在打包以后的代码里去获取这个变量。
            'process.env.API_BASE':'"http://127.0.0.1:3333"'  //用DefinePlugin定义的变量，值如果是字符串，需要用单引号里面用双引号引起来，让其为一个字符串。
        })
    ]
});
