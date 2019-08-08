const axios = require('axios');
const querystring = require('query-string');//在没有用querystring.stringify转化前，字符串是以{'accesstoken':'xxx'}这样的形式传输的；而使用这个转化后，就变为'accesstoken=xxx'这样的格式。

const baseUrl = 'https://cnodejs.org/api/v1';
module.exports = function (req,res,next) {
  const path = req.path;
  const user = req.session.user || {};  //判断用户是否登录
  const needAccessToken = req.query.needAccessToken;

  if(needAccessToken && !user.accessToken){
    res.status(401).send({
      success:false,
      msg:'need login'
    })
  }

  /** 进行代理 **/
  //我们并不知道这个请求有没有一个query。如果是get请求的话可能会有query的参数，不能直接把query传过去，因为有我们自己加的一些属性，比如needAccessToken。需要把query重新定义一下：
  const query = Object.assign({},req.query,{
      accesstoken:(needAccessToken && req.method === 'GET') ? user.accessToken : ''
  });
  if(query.needAccessToken) delete query.needAccessToken;
  //method跟客户端发送过来的请求是一样的
  //在axios里面，query是用params这个key来传递的。data是req的body，body需要加上accessToken，即便对方不需要accessToken加上也没关系。
  //cnode API有个小问题，需要加上headers。因为cnode API使用axios直接发送时，它的content-type是json的，cnode API有些API可以接受application json有些不能，只能用form-data传输。为了防止出现问题，把所有content-type设为‘application/x-www-form-urlencoded’,这样axios发送请求的时候用form data的形式发送请求。
  axios(`${baseUrl}${path}`,{
    method: req.method,
    parmas:query,
    data:querystring.stringify(Object.assign({},req.body,{
      accesstoken:(needAccessToken && req.method === 'POST') ? user.accessToken : ''
    })),
    headers:{
      'Content-Type':'application/x-www-form-urlencoded'
    }
  }).then(resp => {
    if(resp.status == 200){
      res.send(resp.data)
    }else {
      res.status(resp.status).send(resp.data)
    }
  }).catch(err => {
    if(err.response){
      res.status(500).send(err.response.data)
    }else {
      res.status(500).send({
        success:false,
        msg:'未知错误'
      })
    }
  })
};
