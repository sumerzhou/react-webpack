import React from 'react'
//这里跟客户端使用的BrowserRouter不一样，StaticRouter是react router专门提供做服务端渲染的组件。
import { StaticRouter } from 'react-router-dom'
import { Provider, useStaticRendering } from 'mobx-react'
import { JssProvider } from 'react-jss'
import { MuiThemeProvider } from '@material-ui/core/styles'
import App from './views/App'
import { createStoreMap } from './store/store'

//useStaticRendering也是专门在服务端渲染时候mobx-react提供的一个工具。告诉它使用静态的渲染。
//具体做的事情是，让mobx在服务端渲染的时候不会重复数据变换。
//Mobx是个reactive的框架，每一次数据变化会造成其他一些方法的调用，比方说computed的方法。在服务端渲染时，如果正常使用客户端代码在做它会有一个bug，就是它的一次渲染导致computed经常去执行非常多次数而且如果改的变量比较多会造成重复引用重复调用的问题，这样会导致内存溢出。所以提供了useStaticRendering去使用。
useStaticRendering(true);
//服务端的store需要在服务端渲染的时候去生成，因为服务端渲染会有不同的请求进来，不可能将同一个store在不同的请求里去使用。因为一个store第一次请求的时候可能已经初始化一些数据了，在第二次请求时又去使用这个store又初始化另外一部分数据，这样造成的结果就是数据的改来改去。所以每次这个store都要重新创建，所以从外面传入store。
//在provider上可以提供多个store，所以传入stores,它是个键值对的对象。
//StaticRouter接收两个参数：
//一个context，它是服务端渲染时传给StaticRouter的对象，它会在静态渲染时对这个对象进行一些操作，然后返回一些有用的信息去做些对应的操作。比如说要做redirect，它会在context对象上加url告诉我们要redirect到某个地方，那我们可以在服务端直接redirect到那个地方。所以这个对象也要从外面传进来。
//另一个是location，它是现在这个请求的url。
export default (stores, routerContext, sheetsRegistry, generateClassName, theme, url) => (
  <Provider {...stores}>
    <StaticRouter context={routerContext} location={url}>
      <JssProvider registry={sheetsRegistry} generateClassName={generateClassName}>
        <MuiThemeProvider theme={theme}>
          <App />
        </MuiThemeProvider>
      </JssProvider>
    </StaticRouter>
  </Provider>
)

export { createStoreMap }
