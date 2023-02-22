import store from '../store'

class AlertManager {
  constructor() {
    this.alertTasks = {
      search: [
        this.googleInitError,
        this.searchEntityError,
        this.budgetExceededError,
        this.searchCompleteError,
        this.noSearchInitializedError,
      ],
      selectFile: [
        this.fileError,
      ],
      loadFile: [
        this.fileLoadedError,
        this.existingDataWarning,
      ],
      buildSearch: [
        this.resolutionError,
        this.searchEntityError,
        this.polygonError,
      ],
      changeSearchType: [
        this.existingDataWarning,
      ],
      clearSearch: [
        this.existingDataWarning,
      ],
      bulkSearch: [
        this.confirmBulkSearch,
      ],
      googleApiError: [
        this.googleApiError
      ]
    }
  }

  hasAlert(alertKey, args) {
    console.log(alertKey)
    console.log(this.alertTasks)
    const alerts = this.alertTasks[alertKey] || undefined;

    if (alerts) {
      for (let i = 0; i < alerts.length; i += 1) {
        console.log(alerts[i]);

        const result = alerts[i](args);
        if (result) {
          return result;
        }
      }
    } else {
      throw new Error('invalid alert key');
    }
    return false;
  }

  //   try {
  //     if (alertKey in this.alertTasks) {
  //       for (const func of this.alertTasks[alertKey]) {
  //         const result = func(args)
  //         if (result != false) {
  //           return result
  //         }
  //       }
  //     } else {
  //       throw new Error('invalid alert key');
  //     }
  //     return false;
  //   } catch (error) {
  //     throw new Error(error);
  //   }
  // }

  static fileError(args) {
    const { dataFile } = args;
    const dataFileJson = JSON.parse(dataFile);

    const requiredKeys = [
      'searchedCoords',
      'unsearchedCoords',
      'searchedAreas',
      'googleData',
      'searchEntityType',
      'budget',
      'budgetUsed',
      'searchResolution',
      'userSearchKey',
      'nextCenter',
      'lastSearchRadius',
      'searchID',
      'polygonCoordinates',
      'mapPolygons',
    ];

    for (let i = 0; i < requiredKeys.length; i += 1) {
      if (!Object.keys(dataFileJson).includes(requiredKeys[i])) {
        return {
          title: 'File Error',
          text: `Your selected file is missing required JSON key "${requiredKeys[i]}".  Please select a valid file to load.`,
          type: 'Alert',
        };
      }
    }
    return false;
  }

  static fileLoadedError() {
    if (Object.keys(store.getState().loadFile.fileData).length === 0) {
      return {
        title: 'No File Selected',
        text: 'Please select a file to load prior to building your search.',
        type: 'Alert',
      };
    }
    return false;
  }

  static noSearchInitializedError() {
    if (store.getState().search.unsearchedCoords.length === 0) {
      return {
        title: 'No Search Initialized',
        text: 'No coordinates are available to search.  Please make sure to "Build Search" or "Build Search From File" prior to conducting additional searches within your selected region.',
        type: 'Alert',
      };
    }
    return false;
  }

  static googleInitError() {
    if (!store.getState().settingsPanel.testMode) {
      if (!window.google || store.getState().settingsPanel.apiKey === '') {
        return {
          title: 'Google Places API Key Required',
          text: 'Please make sure to enter your Google API key, and load it into your search using the "Set Key" button.',
          type: 'Alert',
        };
      }
    }
    return false;
  }

  static polygonError() {
    if (
      !store.getState().map.polygonCoordinates
      || store.getState().map.polygonCoordinates.length === 0
    ) {
      return {
        title: 'No Search Area Selected',
        text: 'Please use the "Select Search Area" option to choose a search region before building your search.',
        type: 'Alert',
      };
    }
    return false;
  }

  static resolutionError() {
    if (
      store.getState().settingsPanel.searchResolution < 0.1
      || !store.getState().settingsPanel.searchResolution
    ) {
      return {
        title: 'Resolution Setting Required',
        text: 'Please enter a value for the "Search Resolution".  This is the distance in miles between each potential search coordinate that will be evaluated.',
        type: 'Alert',
      };
    }
    return false;
  }

  static searchEntityError() {
    if (
      store.getState().settingsPanel.searchEntityType === 'Select'
      || !store.getState().settingsPanel.searchEntityType
    ) {
      return {
        title: 'Search Entity Required',
        text: 'Please select an "Entity Type" before building your search.  This is the type of Google Places Entity that the Places API will search for.',
        type: 'Alert',
      };
    }
    return false;
  }

  static searchCompleteError() {
    if (
      store.getState().search.unsearchedCoords.length === 0
      && store.getState().search.searchedCoords.length !== 0
    ) {
      return {
        title: 'Search Complete',
        text: 'All coordinate points for your defined region have been searched. If any areas in your search region are unsearched, you may need to repeat the search with a lower Search Resolution value.',
        type: 'Alert',
      };
    }
    return false;
  }

  static budgetExceededError() {
    if (
      store.getState().settingsPanel.budgetUsed >= store.getState().settingsPanel.budget
      || store.getState().settingsPanel.budget <= 0
    ) {
      return {
        title: 'Budget Has Been Exceeded',
        text: 'You have exhausted your set budget. To run additional searches or build a new search, please increase your budget setting.',
        type: 'Alert',
      };
    }
    return false;
  }

  static existingDataWarning() {
    if (
      ((store.getState().map.polygonCoordinates
      && store.getState().map.polygonCoordinates.length > 0)
      || store.getState().search.googleData.length !== 0
      || store.getState().search.searchedCoords.length !== 0
      || store.getState().search.unsearchedCoords.length !== 0)
    ) {
      return {
        title: 'WARNING: Data Deletion',
        text: 'Data is present from an in-progress search session.'
        + ' If you continue, this data will be lost.  Please use the "Download Data"'
        + ' option if you wish to keep your current data.',
        type: 'Confirmation',
      };
    }
    return false;
  }

  static confirmBulkSearch() {
    const { bulkSearchCount } = store.getState().search;
    const totalCost = 0.017 * parseInt(bulkSearchCount, 10);
    return {
      title: 'Bulk Search Confirmation',
      text: `Please confirm you would like to execute ${bulkSearchCount} calls to the Google Places Api` +
      `for a projected total cost of $${totalCost}.`,
      type: 'Confirmation',
    };
  }

  static googleApiError() {
    return {
      title: 'Google API Error',
      text: 'The Google Places API has encountered a problem.'
        + 'Please check that your API key is correct'
        + ' and that the key is authorized for Google\'s "Maps JavaScript API" and "Places API".'
        + ' This can be done from the Google Cloud Console.'
        + '\n \n'
        + 'Click "OK" to be taken to the instruction page for creating Google API keys and enabling the required APIs'
        + ' at the below URL:\n \n'
        + 'https://developers.google.com/maps/documentation/javascript/get-api-key',
      type: 'Alert',
    };
  }
}

const alertManager = new AlertManager();

export default alertManager;
