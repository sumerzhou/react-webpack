import React from 'react'
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import cx from 'classnames'
import { topicPrimaryStyle, topicSecondaryStyle } from './style'
import { tabs } from '../../util/variable-define'

const Primary = ({ classes, topic }) => {
  const className = cx({
    [classes.tab]: true,
    [classes.top]: topic.top,
  });
  return (
    <div className={classes.root}>
      <span className={className}>{topic.top ? '置顶' : tabs[topic.tab]}</span>
      <span className={classes.title}>{topic.title}</span>
    </div>
  )
};
const StyledPrimary = withStyles(topicPrimaryStyle)(Primary);
const Secondary = ({ classes, topic }) => (
  <span className={classes.root}>
    <span className={classes.userName}>{topic.author.loginname}</span>
    <span className={classes.count}>
      <span className={classes.accentColor}>{topic.reply_count}</span>
      <span>/</span>
      <span>{topic.visit_count}</span>
    </span>
    <span>创建时间:{topic.create_at}</span>
  </span>
);
const StyledSecondary = withStyles(topicSecondaryStyle)(Secondary);
Primary.propTypes = {
  topic: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};
Secondary.propTypes = {
  topic: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
};

const TopicListItem = ({ onClick, topic }) => (
  <ListItem button onClick={onClick}>
    <ListItemAvatar>
      <Avatar src={topic.author.avatar_url} />
    </ListItemAvatar>
    <ListItemText
      primary={<StyledPrimary topic={topic} />}
      secondary={<StyledSecondary topic={topic} />}
    />
  </ListItem>
);
TopicListItem.propTypes = {
  onClick: PropTypes.func.isRequired,
  topic: PropTypes.object.isRequired,
};

export default TopicListItem

