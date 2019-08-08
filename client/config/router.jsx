import React from 'react'
import { Route, Redirect, withRouter } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import PropTypes from 'prop-types'

import TopicList from '../views/topic-list/index'
import TopicDetail from '../views/topic-detail/index'
import TestApi from '../views/test/api-test'
import UserLogin from '../views/user/login'
import UserInfo from '../views/user/info'

const PrivateRoute = ({ isLogin, component: Component, ...rest }) => (
  <Route
    {...rest}
    render={
      props => (
        isLogin ?
          <Component {...props} /> :
          <Redirect
            to={{
              pathname: '/user/login',
              search: `?from=${rest.path}`, //从哪里来，登录之后可以调回来处。
            }}
          />
      )
    }
  />
)
//因为PrivateRoute是纯函数而不是class，Mobx不能使用@这种写法，要用函数的写法。
const InjectedPrivateRoute = withRouter(inject(stores => ({
  isLogin: stores.appState.user.isLogin,
}))(observer(PrivateRoute)));
PrivateRoute.propTypes = {
  isLogin: PropTypes.bool,
  component: PropTypes.element.isRequired,
};
PrivateRoute.defaultProps = {
  isLogin: false,
};

export default () => [
  <Route path="/" render={() => <Redirect to="/list" />} exact />,
  <Route path="/list" component={TopicList} />,
  <Route path="/detail/:id" component={TopicDetail} />,
  <Route path="/test" component={TestApi} />,
  <Route path="/user/login" exact component={UserLogin} />,
  <InjectedPrivateRoute path="/user/info" exact component={UserInfo} />,
]

