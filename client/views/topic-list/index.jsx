import React from 'react'
import { observer, inject } from 'mobx-react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import Button from '@material-ui/core/Button'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import List from '@material-ui/core/List'
import CircularProgress from '@material-ui/core/CircularProgress';//圆形loading组件
import queryString from 'query-string'
import { AppState } from '../../store/app-state'
import Container from '../layout/container'
import TopicListItem from './list-item'
import { tabs } from '../../util/variable-define'

//inject用来注入provider上提供的东西到组件
//observer告诉我们这个组件是observable的，它是reactive的，store里面的值一更新组件里的内容也会更新。
// @inject('appState') @observer
//我们换一个方式去注入。因为后续可能会注入一些奇怪的东西，如果直接以字符串的方式注入，那只能注入名字，这样扩展性比价差。
//注入时使用一个方法，方法接收一个stores参数。stores是一个对象，包含了在app.js里Provider上定义的任何属性的名字。
@inject(stores => ({
  appState: stores.appState,
  topicStore: stores.topicStore,
})) @observer
export default class TopicList extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  };//router是在使用react-router时候加到react的context里面的，
  //从最顶层加上去之后，可以在下面所有的组件里面通过这种方式获取到context（就是router）。

  constructor() {
    super();
    this.changeName = this.changeName.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.listItemClick = this.listItemClick.bind(this);
  }

  componentDidMount() {
    // 获取数据
    const tab = this.getTab();
    this.props.topicStore.fetchTopics(tab)
  }

  componentWillReceiveProps(nextProps) {
    // console.log('nextProps:', nextProps, 'this.props:', this.props);
    if (nextProps.location.search !== this.props.location.search) {
      this.props.topicStore.fetchTopics(this.getTab(nextProps.location.search))
    }
  }

  asyncBootstrap() {
    /*return new Promise((resolve) => {
      setTimeout(() => {
        this.props.appState.count = 3;
        resolve(true);//一定要resolve(true),asyncBootstrap会根据resolve的内容true还是false来决定这个方法有没有执行成功。
      })
    })*/
    const query = queryString.parse(this.props.location.search);
    const { tab } = query;
    return this.props.topicStore.fetchTopics(tab || 'all').then(() => true).catch(() => false)
  }

  changeName(event) {
    this.props.appState.changeName(event.target.value)
  }

  getTab(search) {
    search = search || this.props.location.search;
    const query = queryString.parse(search);//把query字符串转成json形式
    // console.log('tab:', query.tab);
    return query.tab || 'all';//默认情况下进来的路由可能是没有query string的，所以定义一个默认值
  }

  changeTab(e, value) {
    //路由跳转.需要使用到router对象
    this.context.router.history.push({
      search: `?tab=${value}`,
    })
  }

  listItemClick(topic) {
    this.context.router.history.push(`/detail/${topic.id}`);
  }

  render() {
    const { topicStore } = this.props;
    const topicList = topicStore.topics;
    const syncingTopics = topicStore.syncing;
    //location对象其实是react-router的Route组件在渲染实际的组件的时候就已经传进来了。所以可以直接使用。
    const tab = this.getTab();
    return (
      <Container>
        <Helmet>
          <title>this is topic list</title>
          <meta name="description" content="this is description" />
        </Helmet>
        <Tabs value={tab} onChange={this.changeTab}>
          {
            Object.keys(tabs).map(t => (
              <Tab label={tabs[t]} value={t} />
            ))
          }
        </Tabs>
        <List>
          {
            topicList.map(topic => <TopicListItem onClick={() => this.listItemClick(topic)} topic={topic} />)
          }
        </List>
        {
          syncingTopics ?
            (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  padding: '40px 0',
                }}
              >
                <CircularProgress color="accent" size={100} />
              </div>
            ) : null
        }
        <Button variant="raised" color="primary">this is a button</Button>
        <input type="text" onChange={this.changeName} />
        <span>{this.props.appState.msg}</span>
      </Container>
    )
  }
}

TopicList.wrappedComponent.propTypes = {
  appState: PropTypes.instanceOf(AppState).isRequired,
  topicStore: PropTypes.object.isRequired,
};//验证Mobx注入的内容的时候，使用wrappedComponent来验证。

TopicList.propTypes = {
  location: PropTypes.object.isRequired,
};
