import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import HomeIcon from '@material-ui/icons/Home'
import { inject, observer } from 'mobx-react'

const styles = {
  root: {
    width: '100%',
  },
  flex: {
    flex: 1,
  },
};

@inject(stores => ({
  appState: stores.appState,
})) @observer
class MainAppBar extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  };
  constructor() {
    super();//super()方法在有申明constructor方法时一定要写，因为是extend自React.Cmponent。如果没有申明constructor方法，super()会默认执行。
    this.onHomeIconClick = this.onHomeIconClick.bind(this);
    this.createButtonClick = this.createButtonClick.bind(this);
    this.loginButtonClick = this.loginButtonClick.bind(this);
  }

  onHomeIconClick() {
    this.context.router.history.push('/list?tab=all');
  }
  /* eslint-disable */
  createButtonClick() {

  }
  /* eslint-enable */

  loginButtonClick() {
    if (this.props.appState.user.isLogin) {
      this.context.router.history.push('/user/info');
    } else {
      this.context.router.history.push('/user/login');
    }
  }

  render() {
    const { classes } = this.props;
    const { user } = this.props.appState;
    return (
      <div className={classes.root}>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton color="contrast" onClick={this.onHomeIconClick}>
              <HomeIcon />
            </IconButton>
            <Typography type="title" color="inherit" className={classes.flex}>
              JNode
            </Typography>
            <Button variant="raised" color="accent" onClick={this.createButtonClick}>
              新建话题
            </Button>
            <Button color="contrast" onClick={this.loginButtonClick}>
              {
                user.isLogin ? user.info.loginname : '登录'
              }
            </Button>
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}
MainAppBar.wrappedComponent.propTypes = {
  appState: PropTypes.object.isRequired,
};
MainAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};
//使用withStyles方法会给组件外面套一层组件，形成css。
//套完后会给props传一个classes对象，classes里包含了定义的样式。
export default withStyles(styles)(MainAppBar)
