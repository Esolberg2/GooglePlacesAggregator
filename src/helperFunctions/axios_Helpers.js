import axios from 'axios'


export async function axiosPutPostData(method, url = '', data = {}) {
  console.log("data")
  console.log(data)
  const replacer = (key, value) => typeof value === 'undefined' ? null : value;
  let axiosArgs = {
    method: method,
    url: url,
    responseType: 'stream',
    data: data
  }
  console.log("axios args")
  console.log(axiosArgs)

  let result = await axios(axiosArgs)
  console.log('baz')
  console.log(result)
  return result
}
