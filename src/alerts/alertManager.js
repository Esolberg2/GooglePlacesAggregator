// import { useSelector, useDispatch } from 'react-redux'
import { store } from '../store'

class AlertManager {
  constructor() {
    this.alertTasks = {
      "search": [
        this._googleInitError,
        this._searchEntityError,
        this._budgetExceededError,
        this._searchCompleteError,
        this._noSearchInitializedError
      ],
      "selectFile": [
        this._fileError,
      ],
      "loadFile": [
        this._fileLoadedError,
      ],
      "buildSearch": [
        this._resolutionError,
        this._polygonError,
      ],
      "changeSearchType": []
    }
  }

//   _noSearchInitializedError
// _googleInitError


  hasAlert(alertKey, args) {
    console.log("====" + alertKey + "====")
    console.log(alertKey in this.alertTasks)

    if (alertKey in this.alertTasks) {

      for (const func of this.alertTasks[alertKey]) {
        let result = func(args)
        if (result != false) {
          console.log("------", result)
          return result
        }
      }
    } else {
      console.log("invalid alert key")
    }
    return false

  }

  _fileError(args) {
    let dataFile = args.dataFile
    let dataFileJson = JSON.parse(dataFile);

    let requiredKeys = [
      "searchedCoords",
      "unsearchedCoords",
      "searchedAreas",
      "googleData",
      "searchEntityType",
      "budget",
      "budgetUsed",
      "searchResolution",
      "userSearchKey",
      "nextCenter",
      "lastSearchRadius",
      "searchID",
      "polygons"
    ];

    for (let i=0; i < requiredKeys.length; i++) {
      if (!Object.keys(dataFileJson).includes(requiredKeys[i])) {
        return `Your selected file is missing required JSON key "${requiredKeys[i]}".  Please select a valid file to load.`
      }
    }
    return false;
  };

  _fileLoadedError(args) {
    if (Object.keys(store.getState().search.fileData).length === 0) {
      return 'Please select a file to load prior to building your search.'
    }
    return false;
  };

  _noSearchInitializedError(args) {
    console.log(store.getState().search.unsearchedCoords)
    if (store.getState().search.unsearchedCoords.length == 0) {
      console.log("_noSearchInitializedError should trigger")
      return 'No coordinates are available to search.  Please make sure to "Build Search" or "Build Search From File" prior to conducting additional searches within your selected region.'
    }
    return false;
  };

  _googleInitError(args) {
    if (!store.getState().settingsPanel.testMode) {
      if (!window.google) {
        return 'Please make sure to enter your Google API key, and load it into your search using the "Set Key" button.'
      }
    }
    return false;
  };

  _polygonError(args) {
    console.log(store.getState().map.polygons)
    if (!store.getState().map.polygons || store.getState().map.polygons.length == 0) {
      // window.alert('Please use the "Select Search Area" option to choose a search region before building your search.');
      // return true;
      return 'Please use the "Select Search Area" option to choose a search region before building your search.'
    }
    return false;
  };

  _resolutionError(args) {
    if (store.getState().settingsPanel.searchResolution < 0.1 || !store.getState().settingsPanel.searchResolution) {
      // window.alert('Please enter a value for the "Search Resolution".  This is the distance in miles between each potential search coordinate that will be evaluated.');
      // return true;
      return 'Please enter a value for the "Search Resolution".  This is the distance in miles between each potential search coordinate that will be evaluated.'
    }
    return false;
  };


  _searchEntityError(args) {
    console.log(store.getState().settingsPanel.searchEntityType)
    if (store.getState().settingsPanel.searchEntityType == "Select" || !store.getState().settingsPanel.searchEntityType) {
      // window.alert('Please select an "Entity Type" before building your search.  This is the type of Google Places Entity that the Places API will search for.');
      // return true;
      console.log("    _searchEntityError test error found")
      return 'Please select an "Entity Type" before building your search.  This is the type of Google Places Entity that the Places API will search for.'
    }
    return false;
  };

  _searchCompleteError(args) {
    if (store.getState().search.unsearchedCoords.length == 0 && store.getState().search.searchedCoords.length != 0) {
      // window.alert('All coordinate points for your defined region have been searched. If any areas in your search region are unsearched, you may need to repeat the search with a lower Search Resolution value.');
      // return true;
      return 'All coordinate points for your defined region have been searched. If any areas in your search region are unsearched, you may need to repeat the search with a lower Search Resolution value.'
    }
    return false;
  };

  _budgetExceededError(args) {
    console.log(store.getState().settingsPanel.budget)
    console.log(!store.getState().settingsPanel.budget >= 0)
    if (store.getState().settingsPanel.budgetUsed >= store.getState().settingsPanel.budget || store.getState().settingsPanel.budget <= 0) {
      // window.alert('You have exhausted your set budget. To run additional searches or build a new search, please increase your budget setting.')
      return 'You have exhausted your set budget. To run additional searches or build a new search, please increase your budget setting.'
    }
    return false
  }
}


export const alertManager = new AlertManager();
