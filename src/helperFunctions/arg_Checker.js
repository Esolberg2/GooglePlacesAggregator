

export function triggerAlertFor(funcs) {
  console.log("triggerAlertFor run")
  const funcMap = {
    "searchType": searchTypeError,
    "resolution": resolutionError,
    "polygons": polygonError,
    "googleInit": googleInitError,
    "searchComplete": searchCompleteError,
    "searchInit": noSearchInitializedError,
    "budgetExceeded": budgetExceededError,
    "fileLoaded": fileLoadedError,
    "fileError": fileError,
    "searchComplete2": searchCompleteError2,
  }

  let difference = funcs.filter(func => !Object.keys(funcMap).includes(func[0]));
  if (difference.length > 0) {
    throw new Error(`The following function keys were not found ${difference}`)
  } else {
    for (let i=0; i < funcs.length; i++) {
      let status = funcMap[funcs[i][0]](...funcs[i][1])
      console.log(funcs[i])
      console.log(status)
      if (status) {
        return true
      }
    }
    return false
  }
}

function fileError(dataFile) {
  let dataFileJson = JSON.parse(dataFile.current)
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
  ]

  for (let i=0; i < requiredKeys.length; i++) {
    if (!Object.keys(dataFileJson).includes(requiredKeys[i])) {
      console.log(requiredKeys[i])
      window.alert('Your selected file is missing required fields.  Please select a valid file to load.')
      return true
    }
    return false
  }



}

function fileLoadedError(dataFile) {
  if (!dataFile.current) {
    window.alert('Please select a file to load prior to building your search.')
    return true
  }
  return false
}

function budgetExceededError(budgetSet, budgetUsed) {
  console.log(budgetUsed, budgetSet)
  if (budgetSet == -1) {
    return false
  }
  if (budgetUsed >= budgetSet || !budgetSet) {
    window.alert('You have exhausted your set budget. To run additional searches or build a new search, please increase your budget setting.')
    return true
  }
  return false
}

function noSearchInitializedError(unsearchedData) {
  if (unsearchedData.current == undefined) {
    window.alert('No coordinates are available to search.  Please make sure to "Build Search" or "Build Search From File" prior to conducting additional searches within your selected region.')
    return true
  }
  return false
}

function googleInitError() {
  if (!window.google) {
    window.alert('Please make sure to enter your Google API key, and load it into your search using the "Set Key" button.')
    console.log(window)
    return true
  }
  return false
}

function polygonError(polygons) {
  console.log(polygons)
  if (polygons.length == 0) {
    window.alert('Please use the "Select Search Area" option to choose a search region before building your search.')
    return true
  }
  return false
}

function resolutionError(searchResolution) {
  if (searchResolution < 0.1 || !searchResolution) {
    window.alert('Please enter a value for the "Search Resolution".  This is the distance in miles between each potential search coordinate that will be evaluated.')
    return true
  }
  return false
}

function searchTypeError(searchType) {
  if (searchType == "Select" || !searchType) {
    window.alert('Please select an "Entity Type" before building your search.  This is the type of Google Places Entity that the Places API will search for.')
    return true
  }
  return false
}

function searchCompleteError(unsearchedCoords) {
  if (unsearchedCoords.current && unsearchedCoords.current.length == 0) {
    window.alert('All coordinate points for your defined region have been searched. If any areas in your search region are unsearched, you may need to repeat the search with a lower Search Resolution value.')
    return true
  }
  return false
}

function searchCompleteError2(searchComplete) {
  if (searchComplete.current) {
    window.alert('All coordinate points for your defined region have been searched. If any areas in your search region are unsearched, you may need to repeat the search with a lower Search Resolution value.')
    return true
  }
  return false
}
