import AppState from './app-state'
import TopicStore from './topic-store'

export { AppState, TopicStore }

export default {
  AppState,
  TopicStore,
}

//这个函数是专门给服务端渲染用的
export const createStoreMap = () => ({
  appState: new AppState(),
  topicStore: new TopicStore(),
})
