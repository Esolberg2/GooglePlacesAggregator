
function first() {
  console.log('first')
}
//
function second() {
  console.log('second')
}
//
//
//
// function promiseOne() {
//     return new Promise(function(resolve, reject) {
//         first = resolve;
//     });
// }



function myDisplayer(some) {
  console.log('myDisplayer')
}

let myPromise = new Promise(function(myResolve, myReject) {
  let x = 0;

// The producing code (this may take some time)

  if (x == 0) {
    first()
    myResolve("OK");
  } else {
    myReject("Error");
  }
});

myPromise.then(
  second()
  // function(value) {myDisplayer(value);},
  // function(error) {myDisplayer(error);}
);



// const types = require('./data/placeTypes.json');
// // let t = JSON.stringify(types)
// // console.log(t)
//
// for (let i = 0; i < types.length; i++) {
//   console.log(types[i])
// }

//
// const utf8 = require('utf8');
// const data = require('../test.json');
// var fs = require('fs');
// var CryptoJS = require("crypto-js");
//
//
// let msg = JSON.stringify(data["1"]["searched"])
//
// let dictionary =  JSON.stringify(data)
// var dictChecksum = CryptoJS.MD5(dictionary);
// console.log(dictChecksum.toString())
//
// // console.log(msg.indexOf("9.5790"))
// // console.log(msg.search("9.5790"))
// // console.log(msg)
// // var fs = require('fs');
// // fs.writeFile("jsString.txt", msg, function(err) {
// //   if (err) {
// //     console.log(err);
// //     }
// //   });
// // const noWhitespace = msg.replace(/\s/g, '');
// // console.log(noWhitespace.length)
// // console.log(noWhitespace[noWhitespace.length-1])
// // // msg = utf8.encode(msg)
// // console.log(noWhitespace)
// var key = "bookbookbook";
//
// var signature = CryptoJS.MD5(msg);
// console.log(signature.toString())
//
// var dictChecksum = CryptoJS.MD5(dictionary);
// console.log(dictChecksum.toString())
// // var checksum = CryptoJS.enc.Utf8.parse(signature);
// // console.log(checksum)
// //
// // console.log("checksum: " + CryptoJS.enc.Base64.stringify(checksum));
//
// //
// // let searchedString = JSON.stringify(data["1"]["searched"])
// //
// // function encryptData(data) {
// //   var key = "bookbookbook";
// //   var encrypted = CryptoJS.HmacSHA1(data, key);
// //   return CryptoJS.enc.Base64.stringify(encrypted)
// // }
// //
// // console.log(encryptData(searchedString))
//
