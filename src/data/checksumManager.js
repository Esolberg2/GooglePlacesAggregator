const CryptoJS = require('crypto-js');

class ChecksumManager {
  static buildChecksum(searchedCoords, unsearchedCoords) {
    const data = JSON.stringify({
      searched: searchedCoords,
      unsearched: unsearchedCoords,
    });
    const dataChecksum = CryptoJS.MD5(data);
    return dataChecksum.toString();
  }
}

export default ChecksumManager;
