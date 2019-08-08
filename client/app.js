import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'mobx-react'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { lightBlue, pink } from '@material-ui/core/colors'
import App from './views/App'
import { AppContainer } from 'react-hot-loader'  //eslint-disable-line
import { AppState, TopicStore } from './store/store'

const theme = createMuiTheme({
  palette: {
    primary: lightBlue,
    accent: pink,
    type: 'light',
  },
});

const initialState = window.__INITIAL__STATE__ || {}; //eslint-disable-line
/*const createApp = (TheApp) => { //在客户端时有可能不仅仅是第一次渲染时用到TheApp，或许还会去用到这部分内容，所以每次去新建createApp。
  class Main extends React.Component {
    // Remove the server-side injected CSS.
    componentDidMount() {
      const jssStyles = document.getElementById('jss-server-side');
      if (jssStyles && jssStyles.parentNode) {
        jssStyles.parentNode.removeChild(jssStyles);
      }
    }

    render() {
      return <TheApp />
    }
  }
  return Main
};*/

const appState = new AppState(initialState.appState);
appState.init(initialState.appState);
const topicStore = new TopicStore(initialState.topicStore);
const root = document.getElementById('root');
const render = (Component) => {
  ReactDOM.hydrate(
    <AppContainer>
      <Provider appState={appState} topicStore={topicStore}>
        <BrowserRouter>
          <MuiThemeProvider theme={theme}>
            <Component />
          </MuiThemeProvider>
        </BrowserRouter>
      </Provider>
    </AppContainer>,
    root,
  );
};

render(App);

if (module.hot) {
  module.hot.accept('./views/App', () => { //当需要热更新的代码出现的时候，把app重新加载一边 //eslint-disable-line
    const  NextApp = require('./views/App').default; //eslint-disable-line
    render(NextApp);
  })
}
