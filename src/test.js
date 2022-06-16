
const data = require('../test.json');
var fs = require('fs');
var CryptoJS = require("crypto-js");

// let searchedString = JSON.stringify(data["1"]["searched"])
let searchedString = Buffer.from(data["1"]["searched"])
console.log(searchedString)

function encryptData(data) {
  var key = "bookbookbook";
  var encrypted = CryptoJS.HmacSHA1(data, key);
  return CryptoJS.enc.Base64.stringify(encrypted)
}

console.log(encryptData(searchedString))
// function encrypt(data) {
//   var key = "bookbookbook";
  // var encrypted = CryptoJS.HmacSHA1(data, key);

// console.log(encrypt(searchedString))

  // fs.writeFile("jsString.txt", searchedString, function(err) {
  //   if (err) {
  //     console.log(err);
  //     }
  //   });

// console.log(data["1"]["searched"]);

// let searched = data["1"]["searched"]
//
// function encrypt(data) {
//   var CryptoJS = require("crypto-js");
//   var key = "bookbookbook";
//   var msg = JSON.stringify(data);
//   console.log(type(msg)
//   var encrypted = CryptoJS.HmacSHA1(msg, key);
//   return encrypted

//
//   var fs = require('fs');
//   fs.writeFile("jsJson.json", msg, function(err) {
//       if (err) {
//           console.log(err);
//       }
//   });
//
//   console.log("encrypted in Base64: " + CryptoJS.enc.Base64.stringify(encrypted));
// }
//
// encrypt(searched)
// //53EMUiX5fQKSfCBXcDs7xHzeQYU=
