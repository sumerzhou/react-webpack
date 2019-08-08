const router = require('express').Router();
const axios = require('axios'); //引用axios,因为我们要发送请求

const baseUrl = 'https://cnodejs.org/api/v1';

router.post('/login',function (req,res,next) {
  axios.post(`${baseUrl}/accesstoken `,{
    accesstoken:req.body.accessToken
  })
    .then(resp => {
      if(resp.status == 200 && resp.data.success){
        req.session.user = {
          accessToken: req.body.accessToken,
          loginName: resp.data.loginname,
          id: resp.data.id,
          avatarUrl:resp.data.avatar_url
        };
        res.json({
          success:true,
          data:resp.data
        })
      }
    })
    .catch(err => {
      if(err.response){
        //response的意思是请求有返回，只是有业务逻辑的错误而不是服务器报错。
        res.json({
          success:false,
          data:err.response.data
        })
      }else {
        next(err); //把错误抛给全局的错误处理器去处理。
      }
    })
});

module.exports = router;
