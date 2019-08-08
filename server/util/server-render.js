const ReactDomServer = require('react-dom/server');
const asyncBootstrap = require('react-async-bootstrapper');
const serialize = require('serialize-javascript');
const ejs = require('ejs');
const Helmet = require('react-helmet').default; // 用export和import模式写的代码，需要加上.default
const SheetsRegistry = require('react-jss').SheetsRegistry; //使用require引入时需要后面加上.SheetsRegistry
const createMuiTheme = require('@material-ui/core/styles').createMuiTheme;
const createGenerateClassName = require('@material-ui/core/styles').createGenerateClassName;
const colors = require('@material-ui/core/colors');

const getStoreState = (stores) => {
  //这样就形成了在服务端渲染结束之后，数据的默认值的情况。
  return Object.keys(stores).reduce((result,storeName) => {
    result[storeName] = stores[storeName].toJson();
    return result
  },{})
};

module.exports = (bundle, template, req, res) => {
  return new Promise((resolve, reject) => {
    const createStoreMap = bundle.createStoreMap;
    const createApp = bundle.default;

    const theme = createMuiTheme({
      palette: {
        primary: colors.lightBlue,
        accent: colors.pink,
        type: 'light',
      },
    });//保持和客户端一致
    const sheetsRegistry = new SheetsRegistry(); //theme、sheetsRegistry每个请求都需要去创建
    const generateClassName = createGenerateClassName();
    const routerContext = {};
    const stores = createStoreMap();
    const user = req.session.user;
    if (user) {
      stores.appState.user.isLogin = true;
      stores.appState.user.info = user;
    }
    const app = createApp(stores,routerContext,sheetsRegistry,generateClassName,theme,req.url);//createApp现在已不是一个直接可以渲染的内容，而是一个方法，所以需要根据这个方法去创建渲染内容。
    asyncBootstrap(app).then(() => {
      //asyncBootstrap方法执行app之后返回异步的结果，这个时候已经可以拿到routerContext。
      if(routerContext.url){
        res.status(302).setHeader('Location',routerContext.url);//通过在header上设置location去让浏览器自动跳转。
        res.end();//结束这次请求
        return
      }
      const helmet = Helmet.rewind(); //在当前页面拿到需要显示的title、description这些东西
      console.log(stores.appState.count);
      const state = getStoreState(stores);//拿到想要的值。需要一个方法把数据插到HTML内容里让客户端代码拿到。
      const content = ReactDomServer.renderToString(app);
      const html = ejs.render(template,{
        appString:content,
        initialState:serialize(state),
        meta:helmet.meta.toString(),
        title:helmet.title.toString(),
        style:helmet.style.toString(),
        link:helmet.link.toString(),
        materialCss:sheetsRegistry.toString()
      });
      res.send(html);
      // res.send(template.replace('<!--app-->',content));
      resolve();
    }).catch(reject);
  })
};
