import React from 'react'
import PropTypes from 'prop-types'
import marked from 'marked';//把markdown格式转换成HTML里面显示的内容
import Helmet from 'react-helmet'
import { inject, observer } from 'mobx-react'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '../layout/container'
import { topicDetailStyle } from './styles'
import Reply from './reply'

@inject(stores => ({
  topicStore: stores.topicStore,
})) @observer
class TopicDetail extends React.Component {
  componentDidMount() {
    const id = this.getTopicId();
    this.props.topicStore.getTopicDetail(id);
  }

  getTopicId() {
    return this.props.match.params.id;
  }

  render() {
    const { classes } = this.props;
    const id = this.getTopicId();
    const topic = this.props.topicStore.detailMap[id];
    if (!topic) {
      return (
        <Container>
          <section className={classes.loadingContainer}>
            <CircularProgress color="accent" />
          </section>
        </Container>
      )
    }
    return (
      <div>
        <Container>
          <Helmet>
            <title>{topic.title}</title>
          </Helmet>
          <header className={classes.header}>
            <h3>{topic.title}</h3>
          </header>
          <section className={classes.body}>
            {/*react里面的标签属性dangerouslySetInnerHTML把内容放到p标签下面，直接塞入的HTML内容，不经转义。*/}
            <p dangerouslySetInnerHTML={{ __html: marked(topic.content) }} />
          </section>
        </Container>

        <Paper elevation={4} className={classes.replies}>
          <header className={classes.replyHeader}>
            <span>{`${topic.reply_count} 回复`}</span>
            <span>{`最新回复 ${topic.last_reply_at}`}</span>
          </header>
          <section>
            {
              topic.replies.map(reply => <Reply reply={reply} />)
            }
          </section>
        </Paper>
      </div>
    )
  }
}

TopicDetail.wrappedComponent.propTypes = {
  topicStore: PropTypes.object.isRequired,
};
TopicDetail.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default withStyles(topicDetailStyle)(TopicDetail)
