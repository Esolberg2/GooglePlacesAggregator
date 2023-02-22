const googleData = require('../data/dummyData.json');

function dummyGoogleCall(request, callback) {
  setTimeout(() => {
    callback(googleData);
  }, 500);
}

export default dummyGoogleCall;
