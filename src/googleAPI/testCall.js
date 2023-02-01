import { googlePlacesApiManager } from './googlePlacesApiManager'


const axios = require('axios');
const URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?";

async function test() {
  const response = await axios.get(URL, {
  //We can add more configurations in this object
     params: {
       key: "AIzaSyDrk3576gQUVtPrX92lpQgPUUfJoR6W6BM",
       location: "-33.8670522,151.1957362",
       radius: "1000",
       type: "restaurant"
     }
  })
  return response.data
}

export function testCall() {
  googlePlacesApiManager.nearbySearch().then(data => {
    console.log(data)
  })
}




// console.log(test())
// test().then((res) => {
//   console.log(res)
// })

// // This is the second configuration option
// const res = await axios({
//     method: 'get',
//     url://Endpoint goes here,
//     params:{
//
//     }
// });

// import fetch from 'node-fetch'
// const URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyDrk3576gQUVtPrX92lpQgPUUfJoR6W6BM&location=-33.8670522,151.1957362&radius=5000&type=restaurant";
//
// fetch(URL).then(data=> {
//   return data.json()
// }).then(jsonData => {
//  console.log(jsonData.results)
// }).catch(error=> {
//   console.log(error);
// })
