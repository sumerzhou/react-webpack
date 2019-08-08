const express = require('express');
const favicon = require('serve-favicon');
const fs = require('fs');
const path = require('path'); //在引用某一个文件路径时最好都用path去解析一下，用绝对路径去做，这样不会存在任何问题。
const bodyParser = require('body-parser');
const session = require('express-session');
const serverRender = require('./util/server-render');

const isDev = process.env.NODE_ENV === 'development';
const app = express();

app.use(bodyParser.json()); //把app的json格式的请求数据转化成req.body上面的数据。后面写业务逻辑的时候只要去调用req.body的内容就可以拿到请求里面的数据。
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
  maxAge: 10*60*1000,
  name:'tid',
  resave:false,
  saveUninitialized:false,
  secret:'react cnode'
}));

app.use(favicon(path.join(__dirname,'../favicon.ico')));  //需要在服务端代码渲染之前使用
//一定要放在服务端渲染的代码之前。因为服务端代码所有请求来都会返回，所以要先处理API，API拦截到需要处理的，那API直接返回就可以了。
app.use('/api/user',require('./util/handle-login'));
app.use('/api',require('./util/proxy'));

if(!isDev){
    const serverEntry = require('../dist/server.entry');//服务端代码在server.entry.js中
    const template = fs.readFileSync(path.join(__dirname,'../dist/server.ejs'),'utf8'); //注意要用utf8格式才会变为string，不然是nodejs的buffer
    app.use('/public',express.static(path.join(__dirname,'../dist')));  //给静态文件制定请求返回。express有提供一个模块帮我们去处理这个内容。
    app.get('*',function (req,res,next) {
        // const appString = ReactSSR.renderToString(serverEntry);//服务端渲染得到的内容
        // res.send(template.replace('<!--app-->',appString));
        serverRender(serverEntry,template,req,res).catch(next);
    });
}else {
    const devStatic = require('./util/dev-static');
    devStatic(app);
}

//对于next扔出来的错误，express有一个机制，在全局上可以定义一个error处理的中间件。
//这个中间件会有一定的特殊，后三个参数虽然用不到但还是要传，因为express会去读取参数的长度判断到底是不是个error handler。
app.use(function (error,req,res,next) {
  console.log(err);
  res.status(500).send(error);
});

app.listen(3333,function () {
    console.log('server is listening on 3333...')
});
