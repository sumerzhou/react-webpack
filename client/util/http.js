import axios from 'axios'

const baseUrl = process.env.API_BASE || ''; //在客户端访问的时候，直接为空就可以，并不需要特殊处理。

const parseUrl = (url, params) => {
  params = params || {};
  const str = Object.keys(params).reduce((result, key) => {
    result += `${key}=${params[key]}&`;
    return result
  }, '');
  return `${baseUrl}/api/${url}?${str.substr(0, str.length - 1)}`
};//处理url

//export API。cnode API只提供了get和post两种请求方式。
//params是url‘？’后面的参数
export const get = (url, params) => new Promise((resolve, reject) => {
  axios.get(parseUrl(url, params))
    .then((resp) => {
      const { data } = resp;
      if (data && data.success === true) {
        resolve(data)
      } else {
        reject(data)
      }
    }).catch(reject)
});

export const post = (url, params, datas) => new Promise((resolve, reject) => {
  axios.post(parseUrl(url, params), datas)
    .then((resp) => {
      const { data } = resp;
      if (data && data.success === true) {
        resolve(data)
      } else {
        reject(data)
      }
    }).catch(reject)
});
