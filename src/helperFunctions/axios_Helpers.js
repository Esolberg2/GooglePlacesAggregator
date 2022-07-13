import axios from 'axios'


export async function axiosPutPostData(method, url = '', data = {}) {

  const replacer = (key, value) => typeof value === 'undefined' ? null : value;
  let axiosArgs = {
    method: method,
    url: url,
    data: data
  }

  let result = await axios(axiosArgs)
  // console.log('baz')
  // console.log(result)
  return result
}
