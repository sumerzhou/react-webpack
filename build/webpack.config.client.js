const path = require('path'); //用path完成绝对路径的书写，避免一些因系统差异和其他原因引起的错误
const HTMLPlugin = require('html-webpack-plugin');
const isDev = process.env.NODE_ENV === 'development';  //启动命令时手动输入的.可以让webpack适用于不同的环境
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const baseConfig = require('./webpack.base');



const config =webpackMerge(baseConfig,{  //第二个参数内容会去覆盖或插入到baseConfig的内容中
    entry:{
        app:path.join(__dirname,'../client/app.js')
    },
    output:{
        filename:'[name].[hash].js'
    },
    plugins:[
        new HTMLPlugin({
            template:path.join(__dirname,'../client/template.html') //这样配置后，最终在dist目录下生成的index.html会以template.html作为模板，里面的内容都不变，插入我们生成的js。
        }),   //生成HTML页面，同时在webpack编译的时候，把所有的entry注入到HTML中，而且名称路径也是根据output中的配置。
        new HTMLPlugin({
            template:'!!ejs-compiled-loader!'+path.join(__dirname,'../client/server.template.ejs'), //不能使用默认的loader,
            filename:'server.ejs' //指定filename，以便方便地获取内容
        })//最终需要拿到一个可以用模板引擎去渲染的内容，这样可以方便地把数据插到想要的地方。
    ]
});

if(isDev){
    config.devtool = '#cheap-module-eval-source-map';
    config.entry = {//webpack的entry可以是一个数组，数组代表我们这一个entry里面包含的很多的引用的文件，全部打包到一个文件里面去。
        app:[
            'react-hot-loader/patch', //客户端代码热更新需要用到的内容
            path.join(__dirname,'../client/app.js')
        ]
    };
    //devServer是webpack里面开发环境的一些常用配置
    //因为是在本地开发，最简单是绑定0.0.0.0 ，代表我们可以任何方式进行访问，比方可以用124.0.0.1进行访问。这是指向本机ip的方式。第二种可以使用localhost，也是一样的意思。第三种可以用本机的ip。如果写的是localhost或124.0.0.1，就不能用本机的ip进行访问，存在的问题是如果在局域网内进行开发，别人想连你的电脑进行调试会连不了。
    config.devServer = {
        host:'0.0.0.0',
        port:'8888',
        // contentBase:path.join(__dirname,'../dist'),  //devServer服务于经过webpack编译出来的静态文件的，所以contentBase就是output中的path
        hot:true,  //启动hot module replacement。之前的webpack1.x配置起来是比价麻烦的。
        overlay:{
            errors:true  //只显示错误信息，像warning这些就不用提示了
        },//在webpack编译过程出现任何错误，让它在网页上面显示出一层黑色背景的错误信息。
        publicPath:'/public/', //webpack-dev-server的publicPath,这样就跟webpack的publicPath的配置对应起来。意思是，访问所有dist下的静态路径都要通过前面加‘/public’才能访问到。
        historyApiFallback:{  //historyApiFallback很有用，它配置了很多的对应的关系
            index:'/public/index.html'   //可以让所有404的请求都返回这个HTML
        },
        proxy:{
            '/api':'http://localhost:3333'
        }
    };
    config.plugins.push(new webpack.HotModuleReplacementPlugin())
} else {
  config.entry = {
    app: path.join(__dirname,'../client/app.js'),
    vendor: [
      'react',
      'react-dom',
      'react-router-dom',
      'mobx',
      'mobx-react',
      'axios',
      'query-string',
      'dateformat',
      'marked'
    ]
  }; //第三方的包都放到vendor里，打包成一个vendor.js,这样的话就可以在app entry里面更新之后，vendor里的内容是不更新的，每次都可以用浏览器缓存来使用。
  //在有多个entry的时候使用chunkhash，为每个文件生成的hash码是这个文件内容的hash码，而不是打包完成之后所有内容的hash码。以此来保证app和vendor的hash码是不一样的。
  config.output.filename = '[name].[chunkhash].js';
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin(),  //压缩js源码，把一些变量名之类的变成字符，整个js内容变得更小。
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }), //指定name为vendor，这样才会把app里引用到vendor里的那些包不再重新打包到app entry的js里，而是单独在vendor里去打包。
    //还要注意一个问题，webpack会自动生成一些代码，这些代码每次打包时都会不一样，就算业务代码没有任何更改去打包它，也会产生一些不一样的东西。
    //如果不针对此做配置，会直接打包到vendor里，导致vendor每次都会变换。所以再声明一下，声明一个非entry里声明过的一个节点名，就会自动把内容打包到声明的这个名字里（这里我们声明的名字叫manifest）。
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity  //无线压缩包的大小。因为这部分内容虽说非常重要，但代码形式是比较固定的，可以进行无线压缩。
    })
  )
}

module.exports = config;
