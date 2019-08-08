import React from 'react'
import PropTypes from 'prop-types'
import Avatar from '@material-ui/core/Avatar'
import { withStyles } from '@material-ui/core/styles'
import UserIcon from '@material-ui/icons/AccountCircle'
import { inject, observer } from 'mobx-react'
import Container from '../layout/container'
import userStyles from './styles/user-style'

@inject(stores => ({
  user: stores.appState.user,
})) @observer
class User extends React.Component {
  componentDidMount() {
    // do something
  }

  render() {
    const { classes } = this.props;
    const user = this.props.user.info;
    return (
      <Container>
        <div className={classes.avatar}>
          <div className={classes.bg} />
          {
            user.avatar_url ?
              <Avatar className={classes.avatarImg} src={user.avatar_url} /> :
              <Avatar className={classes.avatarImg}>
                <UserIcon />
              </Avatar>
          }
          <span className={classes.userName}>{user.loginname || '未登录'}</span>
        </div>
        {this.props.children}
      </Container>
    )
  }
}

User.wrappedComponent.propTypes = {
  user: PropTypes.object.isRequired,
};
User.propTypes = {
  classes: PropTypes.object.isRequired,
  children: PropTypes.element.isRequired,
};
export default withStyles(userStyles)(User)
