import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { dummyGoogleCall } from './searchHelpers'
const initialState = {
  searchCallType: "",
  searchReady: false,
  searchComplete: false,
  bulkSearchCount: 0,
}


export const searchNext = createAsyncThunk('newSearch/searchNext',(a, b) => {
  const testMode = b.getState().settings.testMode
  // const searchResolution = b.getState().settingsPanel.searchResolution

  if (testMode) {
    // return dummy data
    await dummyGoogleCall()
  }
  else {
    await nearbySearchWrapper(currentCenter, searchType)
  }

  return axios
    .post(`/api/searchSession`, {
    "searchRegions": polygons,
    "searchID": null,
    "coordinateResolution": searchResolution
    })
    .then((response) => response.data)
})



export async function nextSearch(currentCenter, searchID, checksum, searchType, testMode) {

  try {
    var radius_and_googleData = testMode ? await dummyGoogleCall() : await nearbySearchWrapper(currentCenter, searchType)
  } catch {
    var radius_and_googleData = {"radius": 1, "googleData": zero_results_dummy(...currentCenter)}
  }

  // get perimeter coordinates from effective radius of google call search.
  let circleJson = buildCirclePerimeter(currentCenter, radius_and_googleData["radius"])
  // attempt to calculate the next coordinate to search base on last search.
  try {
    let response = await getNextSearchCoord(circleJson, searchID, checksum)

      // build return data depending on if unsearchedData.lenght == 0, indication search has been completed.
      let unsearchedData = response["data"]["unsearched"]
      return {
          "searchedData": response["data"]["searched"],
          "unsearchedData": unsearchedData,
          "nextCenter": unsearchedData.length == 0 ? null : response["data"]["center"],
          "searchID": searchID,
          "radius": radius_and_googleData["radius"],
          "googleData": unsearchedData.length == 0 ? [] : radius_and_googleData["googleData"]
      }
  } catch (error) {
    throw(error)
  }
}


// step 2 -> returns {"radius": distance, "googleData": results}
async function nearbySearchWrapper(currentCenter, searchType) {

    function callback(results) {
        let lastLat = results[results.length-1].geometry.location.lat()
        let lastLon = results[results.length-1].geometry.location.lng()
        let from = turf.point(currentCenter);
        let to = turf.point([lastLon, lastLat]);
        let options = {units: 'miles'};
        let distance = turf.distance(from, to, options);
        return {"radius": distance, "googleData": results}
        }

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    try {
        var request = {
        location: new window.google.maps.LatLng(currentCenter[1],currentCenter[0]),
        rankBy: window.google.maps.places.RankBy.DISTANCE,
        type: searchType
        };
    } catch (error) {
        console.log("error at google request obj")
        console.log(error)
        }

    let output = await nearbySearch(callback, service, request)
    return output
}


const nearbySearch = (callback, service, request) => new Promise((resolve,reject) => {
  try {

            service.nearbySearch(request, function(results,status){
            if (status === window.google.maps.places.PlacesServiceStatus.OK)
            {
                resolve(callback(results));
            } else
            {
                reject(status);
            }
        });
      } catch (error) {
        console.log(error)
      }
      console.log("error")
})

function buildCirclePerimeter(center, radius) {
  var options = {
    steps: 20,
    units: 'miles',
    options: {}
  };
  var radius = radius;
  var polygon = turf.circle(center, radius, options);
  return polygon.geometry.coordinates[0]
}


async function getNextSearchCoord(circleCoordinates, searchID, checksum) {
  let request = await axiosPutPostData('PUT', `/api/searchSession`,
  { "circleCoordinates": circleCoordinates,
    "searchID": searchID,
    "checksum": checksum
  })
  return request
  }

  //---------



export const newSearchSlice = createSlice({
  name: 'newSearch',
  initialState,

  reducers: {
    addSearchCallType: (state, action) => {state.searchCallType = action.payload},
    setSearchReady: (state, action) => {state.searchReady = action.payload},
    setSearchComplete: (state, action) => {state.searchComplete = action.payload},
    setBulkSearchCount: (state, action) => {state.bulkSearchCount = action.payload}
  },

})

export const newSearchActions = newSearchSlice.actions

export default newSearchSlice.reducer
