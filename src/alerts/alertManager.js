// import { useSelector, useDispatch } from 'react-redux'
import { store } from '../store'

class AlertManager {

  get _searchResolution() {
    return store.getState().settingsPanel.searchResolution;
  };

  get _dataFile() {
    return store.getState().loadSearch.dataFile;
  };

  get _unsearchedData() {
    return store.getState().search.search.data.unsearchedData;
  };

  get _polygons() {
    return store.getState().map.polygons;
  };

  get _searchEntityType() {
    return store.getState().settingsPanel.searchEntityType;
  };

  test() {
    console.log("test", this._searchResolution);
  };

  _fileError() {
    let dataFileJson = JSON.parse(this._dataFile);
    let requiredKeys = [
      "googleData",
      "searchType",
      "searchID",
      "searchCentroid",
      "circleCoordinates",
      "searchedData",
      "unsearchedData",
      "nextCenter",
      "userSearchKey",
      "budgetUsed",
      "budget",
      "searchBorders",
      "searchedAreas",
      "resolution"
    ];

    for (let i=0; i < requiredKeys.length; i++) {
      if (!Object.keys(dataFileJson).includes(requiredKeys[i])) {
        window.alert('Your selected file is missing required fields.  Please select a valid file to load.');
        return true;
      }
      return false;
    };
  };

  _fileLoadedError() {
    if (!this._dataFile) {
      window.alert('Please select a file to load prior to building your search.');
      return true;
    }
    return false;
  };

  _noSearchInitializedError() {
    if (this._unsearchedData == undefined) {
      window.alert('No coordinates are available to search.  Please make sure to "Build Search" or "Build Search From File" prior to conducting additional searches within your selected region.');
      return true;
    }
    return false;
  };

  _googleInitError() {
    if (!window.google) {
      window.alert('Please make sure to enter your Google API key, and load it into your search using the "Set Key" button.');
      return true;
    }
    return false;
  };

  _polygonError(polygons) {
    if (this._polygons == 0) {
      window.alert('Please use the "Select Search Area" option to choose a search region before building your search.');
      return true;
    }
    return false;
  };

  _resolutionError() {
    if (this._searchResolution < 0.1 || !this._searchResolution) {
      window.alert('Please enter a value for the "Search Resolution".  This is the distance in miles between each potential search coordinate that will be evaluated.');
      return true;
    }
    return false;
  };

  _searchEntityError() {
    if (this._searchEntityType == "Select" || !this._searchEntityType) {
      window.alert('Please select an "Entity Type" before building your search.  This is the type of Google Places Entity that the Places API will search for.');
      return true;
    }
    return false;
  };

  _searchCompleteError(searchComplete) {
    if (searchComplete.current) {
      window.alert('All coordinate points for your defined region have been searched. If any areas in your search region are unsearched, you may need to repeat the search with a lower Search Resolution value.');
      return true;
    }
    return false;
  };

}


export const alertManager = new AlertManager();




//
//
// // could be added to reducer comparing budget to budgetUsed whenever budgetUsed is set
// _budgetExceededError(budgetSet, budgetUsed) {
//   if (budgetSet == -1) {
//     return false
//   }
//   if (budgetUsed >= budgetSet || !budgetSet) {
//     window.alert('You have exhausted your set budget. To run additional searches or build a new search, please increase your budget setting.')
//     return true
//   }
//   return false
// }
//
// // reducer should check if unsearchedData is exhausted and update searchComplete state
// _searchCompleteError(unsearchedCoords) {
//   if (unsearchedCoords.current && unsearchedCoords.current.length == 0) {
//     window.alert('All coordinate points for your defined region have been searched. If any areas in your search region are unsearched, you may need to repeat the search with a lower Search Resolution value.');
//     return true;
//   }
//   return false;
// };
