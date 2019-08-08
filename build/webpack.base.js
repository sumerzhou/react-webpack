const path = require('path');
module.exports = {
  output: {
    path:path.join(__dirname,'../dist'),
    publicPath:'/public/' //静态资源引用时的路径,加在HTML文件script便签js资源路径前面，如/public/app.hash.js。帮助区分url是静态资源还是什么
  },
  resolve: {
    extensions: ['.js','.jsx']
  },
  module:{ //配置让webpack可以识别jsx文件
    rules:[
      {
        enforce: "pre",
        test:/.(js|jsx)$/,
        loader: 'eslint-loader',
        exclude:[
          path.resolve(__dirname,'../node_modules')
        ]
      },
      {
        test:/.jsx$/,//说明哪种类型的文件需要特定的loader去加载它
        loader:'babel-loader'
      },
      {
        test:/.js$/,
        loader:'babel-loader',
        exclude:[
          path.join(__dirname,'../node_modules')
        ]
      },
      {
        test:/\.(png|jpg|gif|svg)$/,
        loader:'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  }
};
