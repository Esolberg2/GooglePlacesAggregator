

export function triggerAlertFor(funcs) {
  const funcMap = {
    "searchType": searchTypeError,
    "resolution": resolutionError,
    "polygons": polygonError,
    "googleInit": googleInitError,
    "searchComplete": searchCompleteError
  }

  let difference = funcs.filter(func => !Object.keys(funcMap).includes(func[0]));
  if (difference.length > 0) {
    throw new Error(`The following function keys were not found ${difference}`)
  } else {
    for (let i=0; i < funcs.length; i++) {
      let status = funcMap[funcs[i][0]](...funcs[i][1])
      console.log(status)
      if (status) {
        return true
      }
    }
    return false
  }
}

function googleInitError() {
  if (!window.google) {
    window.alert('Please set your Google API key.')
    return true
  }
}

function polygonError(polygons) {
  console.log(polygons)
  if (polygons.length == 0) {
    window.alert('Please use the "Select Search Area" option to choose a search region before building your search.')
    return true
  }
}

function resolutionError(searchResolution) {
  if (searchResolution < 0.1 || !searchResolution) {
    window.alert('Please enter a value for the "Search Resolution".  This is the distance in miles between each potential search coordinate that will be evaluated.')
    return true
  }
}

function searchTypeError(searchType) {
  if (searchType == "Select") {
    window.alert('Please select an "Entity Type" before building your search.  This is the type of Google Places Entity that the Places API will search for.')
    return true
  }
}

function searchCompleteError(numUnsearchedCoords) {
  console.log(numUnsearchedCoords)
  if (numUnsearchedCoords == 0) {
    window.alert('All coordinate points for your defined region have been searched. If any areas in your search region are unsearched, you may need to repeat the search with a lower Search Resolution value.')
    return true
  }
}
