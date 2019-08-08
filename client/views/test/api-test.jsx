import React from 'react'
import axios from 'axios'

//下面代码只用来测试，所以不希望eslint检测，可使用以下注释方式：
/* eslint-disable */
export default class TestApi extends React.Component {
  getTopics(){
    axios.get('/api/topics')
      .then(resp => {
        console.log(resp)
      }).catch(err => {
        console.log(err)
    })
  }

  login(){
    //accessToken去cnode网站登录账号后的设置中获取。
    axios.post('/api/user/login',{
      accessToken:'d416a50e-f3fc-4286-805d-fc2727157bf3'
    }).then(resp => {
      console.log(resp)
    }).catch(err => {
      console.log(err)
    })
  }

  markAll(){
    axios.post('/api/message/mark_all?needAccessToken=true')
      .then(resp => {
        console.log(resp)
      }).catch(err => {
      console.log(err)
    })
  }

  render(){
    return (
      <div>
        <button onClick={this.getTopics}>topics</button>
        <button onClick={this.login}>login</button>
        <button onClick={this.markAll}>markAll</button>
      </div>
    )
  }
}
/* eslint-enable */
