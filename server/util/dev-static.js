//之前客户端webpack启动的时候，我们能获取到template（会生成dist目录生成index.html）。
//webpack-dev-server启动的时候，也就是开发的时候，template是不写到硬盘上面的，没办法读取到文件。这里我们使用以下方法：

const path = require('path');
const axios = require('axios');//以http请求的方式去webpack-dev-server启动的服务里面去读取这个template

//server端的bundle获取，是通过webpack.config.server.js配置文件去启动webpack后才能拿到bundle，修改任何client下面的文件都会去实时更新bundle的内容。
//在此服务里启动webpack，通过读取webpack打包的结果来获取内容。
const webpack = require('webpack');
const serverConfig = require('../../build/webpack.config.server');
const MemoryFs = require('memory-fs'); //我们不希望serverCompiler把文件输出，因为写到硬盘的过程是比价费时间的，而且降低工作效率。需要安装一个工具memory-fs
const proxy = require('http-proxy-middleware');
const serverRender = require('./server-render');

const getTemplate = () => {  //通过webpack-dev-server实时地拿到最新的template文件
    return new Promise((resolve,reject) => {
        axios.get('http://localhost:8888/public/server.ejs')  //webpack-dev-server启动的是本地的服务，它的url是比较固定的
            .then(res =>{
                resolve(res.data);
            })
            .catch(reject);
    })
};

// const Module = module.constructor;  //通过module构造方法创造一个新的module
const NativeModule = require('module'); //NativeModule其实就是nodejs的module.exports。‘module’是原生的模块，文档上并没有说明这部分内容。它有一个方法wrap()
const vm = require('vm');
const getModuleFromString = (bundle, filename) => {
  const m = { exports: {} };
  const wrapper = NativeModule.wrap(bundle);
  // wrap()方法可以把可执行的javascript代码包装成类似于wrapper:`(function(exports,require,module,__filename,__dirname){ ... bundle code //真正要执行的代码 })`
  // 参数exports就是在bundle code中要执行的module.exports是一样的效果。
  //这些参数是在这个执行环境下去使用的module、require、exports。这些东西wrap之后就成了字符串代码，去调用的时候就可以定制的方式去传入参数。
  const script = new vm.Script(wrapper,{
    filename: filename,
    displayErrors: true  //有错误信息时传出来
  }); //去跑javascript字符串代码，需要用vm的Script类，并且可以去指定context执行环境。
  const result = script.runInThisContext();
  result.call(m.exports, m.exports, require, m);//调用时，用call指定m.exports为调用者去调用result代码，参数exports就是m.exports，参数require就是当前环境下的require，参数module就是m。
  return m;  //通过这种方式，让实际执行的bundle code执行完之后把m.exports的东西全部附在m对象上，这样就可以拿到想要的东西。
};

const mfs = new MemoryFs;  //memory-fs的API跟nodejs的fs是一样的
const serverCompiler = webpack(serverConfig);//通过webpack和它的配置启动一个webpack的compiler,这compiler会去监听entry下面依赖的文件是否有变化，一旦有变会去重新打包。
serverCompiler.outputFileSystem = mfs; //这是webpack提供的一个配置项。指定是mfs之后，以前用fs去读写的文件现通过mfs去读写，速度变得非常快，因为内存的读写比硬盘的读写快非常多.
let serverBundle;
serverCompiler.watch({},(err,stats) => { //{}里是配置文件
    if(err) throw err;
    stats = stats.toJson();  //stats是webpack在打包过程中输出的一些信息
    stats.errors.forEach(err => console.error(err));
    stats.warnings.forEach(warn => console.warn(warn));
    //读取server bundle的信息：
    const bundlePath = path.join(
        serverConfig.output.path,
        serverConfig.output.filename
    );//服务端bundle的整个路径
    const bundle = mfs.readFileSync(bundlePath,'utf-8'); //通过mfs读取文件。bundle是一个string的内容，并非在js中可使用的模块内容.
    //用一个比较hack的方式来使bundle变为js可用的模块内容
    // const m = new Module;
    // m._compile(bundle,'server-entry.js');  //用Module去解析string的内容，它会生成一个新的模块。把新模块放到外部全局变量serverBundle里  //使用这个方法时一定要去指定module的名字，这里叫它server-entry.js。因为我们require的时候是通过文件名的，如果动态编译一个模块，同样要给它指定一个文件名，否则无法在缓存中存储这部分内容
    const m = getModuleFromString(bundle,'server-entry.js');
    // serverBundle = m.exports.default; //因为是在watch里执行的，所以每次bundle有更新serverBundle都会更新   //m模块是通过exports来挂载我们想要从模块里扔出来的东西的。所以通过.exports.default去获取整个serverBundle。
    // createStoreMap = m.exports.createStoreMap; //把createStoreMap方法拿进来
    serverBundle = m.exports;
});


module.exports = function (app) {
    app.use('/public',proxy({
        target:'http://localhost:8888'
    })); //通过代理的方式把静态文件全部代理到webpack devServer启动的这个服务上面。这样只要是‘/public’开头的所有请求都代理到webpack devServer启动的服务上面。

    app.get('*',function (req,res,next) {
        if (!serverBundle){ //优化，webpack的compile正在执行，现在还没发去服务端渲染。这是开发时才会出现的情况。
          return res.send('waiting for compile, refresh later.')
        }
        //返回服务端渲染完成的结果给浏览器端
        getTemplate().then(template => {
          return serverRender(serverBundle,template,req,res)
        }).catch(next)
    });
};
