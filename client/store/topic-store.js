import { observable, action, computed, extendObservable, toJS } from 'mobx'
import { topicSchema } from '../util/variable-define'
import { get } from '../util/http'

const createTopic = topic => Object.assign({}, topicSchema, topic); //返回一个所有字段都有定义的topic对象

//为了让扩展更容易，单独定义一个topic类，每个话题都放到类里面，变成类的实例，可以更好地控制话题的东西。
class Topic {
  constructor(data) {
    //接收topic相关数据，把它赋值到topic的this对象上，这样可以方便地调用topic的实例上面的一些属性。
    //把data里面的东西直接extend到this上面。
    //因为我们要让数据使用Mobx的reactive的特性，如果直接给this附加这些值而没有使用observable这种类型，那这个值就不是reactive的，它的值更新了之后，在组件里去使用这里面的值时，组件里是不会同步更新的。
    //所以所有附加到this上面的属性都要用extendObservable方法，把一个对象上的所有属性附加到另一个对象上。
    extendObservable(this, data);
  }
  //如果有进行异步操作的请求数据的动作，syncing会变成true的状态。这时候可以在组件中去反映出我们在进行一些加载操作。
  @observable syncing = false;
}

class TopicStore {
  @observable topics;
  @observable syncing;
  @observable details;//话题详情数据需要进行缓存。details数组里存放已获取过的有详情的话题列表。

  constructor({ syncing = false, topics = [], details = [] } = {}) {
    this.syncing = syncing;
    //所有在TopicStore里存储的topic相关的东西都用Topic类去操作它。
    this.topics = topics.map(topic => new Topic(createTopic(topic)));
    this.details = details.map(topic => new Topic(createTopic(topic)));
  }

  addTopic(topic) {
    this.topics.push(new Topic(createTopic(topic)))
  }

  @computed get detailMap() { //方便获取某个id下面的details
    return this.details.reduce((result, detail) => {
      result[detail.id] = detail;
      return result;
    }, {})
  }

  @action fetchTopics(tab) {
    return new Promise((resolve, reject) => {
      this.syncing = true;
      //mdrender:告诉CPI是否要把markdown的字符串渲染成HTML字符串，因为cnode写文章的时候是markdown格式的，需要进行一步转义才能在网页进行展现的。
      //在这里我们还是使用markdown格式，因为有时候需编辑markdown内容的时候，如果没有markdown源码就没法编辑。
      this.topics = [];
      get('/topics', {
        mdrender: false,
        tab,
      }).then((resp) => {
        if (resp.success) {
          this.topics = resp.data.map(topic => new Topic(createTopic(topic)));
          resolve();
        } else {
          reject();
        }
        this.syncing = false;
      }).catch((err) => {
        reject(err);
        this.syncing = false;
      })
    })
  }

  @action getTopicDetail(id) {
    return new Promise((resolve, reject) => {
      if (this.detailMap[id]) {
        resolve(this.detailMap[id])
      } else {
        get(`/topic/${id}`, {
          mdrender: false,
        }).then((resp) => {
          if (resp.success) {
            const topic = new Topic(createTopic(resp.data));
            this.details.push(topic);
            resolve(topic);
          } else {
            reject()
          }
        }).catch(reject)
      }
    })
  }
  toJson() {
    return {
      topics: toJS(this.topics),
      syncing: this.syncing,
      details: toJS(this.details),
    }
  }
}
export default TopicStore
