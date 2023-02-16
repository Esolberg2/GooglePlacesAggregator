import { store } from '../store'
const CryptoJS = require("crypto-js");


class ChecksumManager {

  get _getSearchData() {
    return store.getState().search.searchedCoords;
  };

  get _getUnsearchedData() {
    return store.getState().search.unsearchedCoords;
  };

  checksumDataBundler() {
    let dataBundle = {"searched": this._getSearchData, "unsearched": this._getUnsearchedData};
    return dataBundle;
  };

  dataChecksum() {
    let data =  JSON.stringify(this.checksumDataBundler());
    var dataChecksum = CryptoJS.MD5(data);
    return dataChecksum.toString();
  };
}

export const checksumManager = new ChecksumManager()
