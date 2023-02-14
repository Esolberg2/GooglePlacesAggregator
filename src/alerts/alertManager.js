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
        this._existingDataWarning,
      ],
      "buildSearch": [
        this._resolutionError,
        this._searchEntityError,
        this._polygonError,
      ],
      "changeSearchType": [
        this._existingDataWarning
      ],
      "clearSearch": [
        this._existingDataWarning
      ],
      "bulkSearch": [
        this._confirmBulkSearch
      ],
      "googleApiError": [
        this._googleApiError
      ]
    }
  }

  hasAlert(alertKey, args) {
    try {
    if (alertKey in this.alertTasks) {
      for (const func of this.alertTasks[alertKey]) {
        let result = func(args)
        if (result != false) {
          return result
        }
      }
    } else {
      console.log("invalid alert key")
    }
    return false
  } catch (error) {
    console.log(error)
  }

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
      "polygonCoordinates",
      "mapPolygons"
    ];

    for (let i=0; i < requiredKeys.length; i++) {
      if (!Object.keys(dataFileJson).includes(requiredKeys[i])) {
        return {
          text: `Your selected file is missing required JSON key "${requiredKeys[i]}".  Please select a valid file to load.`,
          type: 'Alert'
        }
      }
    }
    return false;
  };

  _fileLoadedError(args) {
    if (Object.keys(store.getState().loadFile.fileData).length === 0) {
      return {
        text: 'Please select a file to load prior to building your search.',
        type: 'Alert'
      }
    }
    return false;
  };

  _noSearchInitializedError(args) {
    console.log(store.getState().search.unsearchedCoords)
    if (store.getState().search.unsearchedCoords.length == 0) {
      console.log("_noSearchInitializedError should trigger")
      return {
        text: 'No coordinates are available to search.  Please make sure to "Build Search" or "Build Search From File" prior to conducting additional searches within your selected region.',
        type: 'Alert'
      }
    }
    return false;
  };

  _googleInitError(args) {
    if (!store.getState().settingsPanel.testMode) {
      if (!window.google || store.getState().settingsPanel.apiKey == '') {
        return {
          text: 'Please make sure to enter your Google API key, and load it into your search using the "Set Key" button.',
          type: 'Alert'
        }
      }
    }
    return false;
  };

  _polygonError(args) {
    console.log(store.getState().map.polygonCoordinates)
    if (!store.getState().map.polygonCoordinates || store.getState().map.polygonCoordinates.length == 0) {
      return {
        text: 'Please use the "Select Search Area" option to choose a search region before building your search.',
        type: 'Alert'
      }
    }
    return false;
  };

  _resolutionError(args) {
    if (store.getState().settingsPanel.searchResolution < 0.1 || !store.getState().settingsPanel.searchResolution) {
      return {
        text: 'Please enter a value for the "Search Resolution".  This is the distance in miles between each potential search coordinate that will be evaluated.',
        type: 'Alert'
      }
    }
    return false;
  };


  _searchEntityError(args) {
    console.log(store.getState().settingsPanel.searchEntityType)
    if (store.getState().settingsPanel.searchEntityType == "Select" || !store.getState().settingsPanel.searchEntityType) {
      return {
      text: 'Please select an "Entity Type" before building your search.  This is the type of Google Places Entity that the Places API will search for.',
      type: 'Alert'
      }
    }
    return false;
  };

  _searchCompleteError(args) {
    if (store.getState().search.unsearchedCoords.length == 0 && store.getState().search.searchedCoords.length != 0) {
      return {
        text: 'All coordinate points for your defined region have been searched. If any areas in your search region are unsearched, you may need to repeat the search with a lower Search Resolution value.',
        type: 'Alert'
      }
    }
    return false;
  };

  _budgetExceededError(args) {
    console.log(store.getState().settingsPanel.budget)
    console.log(!store.getState().settingsPanel.budget >= 0)
    if (store.getState().settingsPanel.budgetUsed >= store.getState().settingsPanel.budget || store.getState().settingsPanel.budget <= 0) {
      return {
        text: 'You have exhausted your set budget. To run additional searches or build a new search, please increase your budget setting.',
        type: 'Alert'
      }
    }
    return false
  }

  _existingDataWarning() {
    if (
      (store.getState().map.polygonCoordinates &&
      store.getState().map.polygonCoordinates.length > 0 ||
      store.getState().search.googleData.length != 0 ||
      store.getState().search.searchedCoords.length != 0 ||
      store.getState().search.unsearchedCoords.length != 0)) {
      return {
        text: "WARNING: Data is present from an in progress search session." +
        " If you continue, this data will be lost.  Please use the 'Download Data'"+
        " option if you wish to keep your current data.",
        type: 'Confirmation'
      }
    }
    return false
  }


  _confirmBulkSearch() {
    let bulkSearchCount = store.getState().search.bulkSearchCount
    let totalCost = 0.017 * parseInt(bulkSearchCount)
    return {
      text: `WARNING: Please confirm you execute ${bulkSearchCount} calls to the Google Places Api.` +
      ` for a projected total cost of $${totalCost}.`,
      type: 'Confirmation'
    }
  }

  _googleApiError() {
    return {
      text: 'The Google Places API has encountered a problem.' +
        'Please check that your API key is correct' +
        ' and that the key is authorized for Google\'s "Maps JavaScript API" and "Places API".' +
        ' This can be done from the Google Cloud Console.' +
        '\n \n' +
        'Click "OK" to be taken to the instruction page for creating Google API keys and enabling the required APIs' +
        ' at the below URL:\n \n' +
        'https://developers.google.com/maps/documentation/javascript/get-api-key',
      type: 'Alert'
    }
  }

}


export const alertManager = new AlertManager();
