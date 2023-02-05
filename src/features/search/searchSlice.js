import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as turf from '@turf/turf'
import { googlePlacesApiManager } from '../../googleAPI/googlePlacesApiManager'
import { dummyGoogleCall } from '../../googleAPI/dummyCall.js'

import { checksumManager } from '../../data/checksumManager'
import { callbackDict, confirmPromise } from '../modal/modalSlice'
import axios from 'axios'

const initialState = {
// == api call meta ==
  loading: false,
  nearbySearchComplete: false,
  error: '',
  searchActive: false,
  priorSearch: false,

// == api data ==
  searchID: '',
  // lon lat
  nextCenter: null,
  lastSearchRadius: null,
  searchedCoords: [],
  unsearchedCoords: [],
  googleData: [],

// == search config ==
  bulkSearchMode: false,
  searchReady: false,
  searchComplete: false,
  bulkSearchCount: 0,
}

export const debounce = createAsyncThunk('search/debounce',(target, b) => {
  if (b.getState().search.loading) {
    console.log("aborted")
    b.abort()
  } else {
    console.log("allowed")
    target()
  }
})

export const initializeSearch = createAsyncThunk('search/initializeSearch',(a, b) => {
  const polygonCoordinates = b.getState().map.polygonCoordinates
  const searchResolution = b.getState().settingsPanel.searchResolution

  return axios
    .post(`/api/searchSession`, {
    "searchRegions": polygonCoordinates,
    "searchID": null,
    "coordinateResolution": searchResolution
    })
    .then((response) => response.data)
    .catch((error) => {
      console.log(error.msg)
    })
})

// const searchCallback = (results, status, thunkAPI) => new Promise((resolve, reject) => {
//
//   let testMode = thunkAPI.getState().settingsPanel.testMode
//   if (testMode || status == window.google.maps.places.PlacesServiceStatus.OK) {
//     console.log(results)
//     results.forEach((item, i) => {
//       delete item.opening_hours
//       delete item.permanently_closed
//     });
//
//     results = JSON.parse(JSON.stringify(results))
//     let testRadius = Math.random() * (1.5 - .1) + .1;
//     let center = thunkAPI.getState().search.nextCenter
//     let searchID = thunkAPI.getState().search.searchID
//     let lastLat = results[results.length-1].geometry.location.lat
//     let lastLon = results[results.length-1].geometry.location.lng
//
//     let from = turf.point(center);
//     let to = turf.point([lastLon, lastLat]);
//     let options = {units: 'miles'};
//
//     let radius = testMode ? testRadius : turf.distance(from, to, options);
//
//     let polygon = turf.circle(center, radius, options);
//     let searchPerimeter = polygon.geometry.coordinates[0];
//
//     processGoogleData(searchID, searchPerimeter)
//       .then((apiData) => {
//         thunkAPI.dispatch(setSearchData(
//           {
//             "lastSearchPerimeter": searchPerimeter,
//             "googleData": results,
//             "apiData": apiData.data
//           }
//         ))
//         resolve()
//       })
//       .catch((error) => {
//         console.log(error)
//         if (error.response.status == 409) {
//           thunkAPI.dispatch(syncBackend())
//         }
//         console.log("FAILED TO SYNC")
//         thunkAPI.abort()
//         return false
//       })
//     }
//
// })
//


function searchCallback(results, status, thunkAPI, resolve){

  let testMode = thunkAPI.getState().settingsPanel.testMode
  if (testMode || status == window.google.maps.places.PlacesServiceStatus.OK) {
    results.forEach((item, i) => {
      delete item.opening_hours
      delete item.permanently_closed
    });

    results = JSON.parse(JSON.stringify(results))
    let testRadius = Math.random() * (1.5 - .1) + .1;
    let center = thunkAPI.getState().search.nextCenter
    let searchID = thunkAPI.getState().search.searchID
    let lastLat = results[results.length-1].geometry.location.lat
    let lastLon = results[results.length-1].geometry.location.lng

    let from = turf.point(center);
    let to = turf.point([lastLon, lastLat]);
    let options = {units: 'miles'};

    let radius = testMode ? testRadius : turf.distance(from, to, options);

    let polygon = turf.circle(center, radius, options);
    let searchPerimeter = polygon.geometry.coordinates[0];

    processGoogleData(searchID, searchPerimeter)
      .then((apiData) => {
        thunkAPI.dispatch(setSearchData(
          {
            "lastSearchPerimeter": searchPerimeter,
            "googleData": results,
            "apiData": apiData.data
          }
        ))
        resolve(apiData)
      })
      .catch((error) => {
        console.log(error)
        if (error.response.status == 409) {
          thunkAPI.dispatch(syncBackend())
        }
        console.log("FAILED TO SYNC")
        thunkAPI.abort()
        return false
      })
    }
}

function processGoogleData(searchID, searchPerimeter) {
  let options = {
    steps: 20,
    units: 'miles',
    options: {}
  };
  return axios
    .put(`/api/searchSession`, {
      "circleCoordinates": searchPerimeter,
      "searchID": searchID,
      "checksum": checksumManager.dataChecksum()
    })
  }

export const searchPlaces = createAsyncThunk('search/searchPlaces', (finished, b) => {
  b.dispatch(setNearbySearchComplete(false))
  let coords = b.getState().search.nextCenter;
  let searchType = b.getState().settingsPanel.searchEntityType;
  let origin = {lat: coords[1], lng: coords[0]};
  let request = {
    location: origin,
    rankBy: 1,
    type: searchType
    };

  new Promise((resolve, reject) => {
    if (b.getState().settingsPanel.testMode) {
      dummyGoogleCall(request, (result, status) => searchCallback(result, status, b, resolve))
    }
    else {
      let service = googlePlacesApiManager.service
      let func = service.nearbySearch
      service.nearbySearch(request, (result, status) => searchCallback(result, status, b, resolve));
    }
  }).then((out) => {
    console.log(out)
    finished()
    return
  })
})


export const bulkSearch = createAsyncThunk('search/bulkSearch', async (a, b) => {
  let i = 0;

  while (i < b.getState().search.bulkSearchCount && b.getState().search.unsearchedCoords.length != 0) {
    let coords = b.getState().search.nextCenter;
    let searchType = b.getState().settingsPanel.searchEntityType;

    if (b.getState().settingsPanel.testMode) {
      await searchCallback(dummyGoogleCall(), null, b)
    }
    else {
      let origin = {lat: coords[1], lng: coords[0]};
      let request = {
        location: origin,
        rankBy: window.google.maps.places.RankBy.DISTANCE,
        type: searchType
        };
      let service = googlePlacesApiManager.service
      service.nearbySearch(request, async (result, status) => await searchCallback(result, status, b));
    }
    i += 1
  }
})


// load search
export const syncBackend = createAsyncThunk('search/syncBackend', async (a, b) => {
    // add search key to data packet
    // search key should be a random number generated by client
    console.log("sync run")
    const searchedCoords = b.getState().search.searchedCoords
    const unsearchedCoords = b.getState().search.unsearchedCoords
    const searchID = b.getState().search.searchID

    let data = await axios
    .put(`/api/loadSearch`, {
      "searched": searchedCoords,
      "unsearched": unsearchedCoords,
      "searchID": searchID,
      })
      .then((result) => {
        console.log("sync successful")
        return result
      })
      .catch((error) => {
        console.log("sync failed")
        return error.msg
      })
})


// ============ Reducers ====================
export const searchSlice = createSlice({
  name: 'searchSlice',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(searchPlaces.pending, (state, action) => {
      state.loading = true
      state.error = ''
    })
    builder.addCase(searchPlaces.fulfilled, (state, action) => {
      console.log(action.payload)
      state.error = ''
    })
    builder.addCase(searchPlaces.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message
    })
    builder.addCase(initializeSearch.pending, (state) => {
      state.loading = true
      state.searchActive = true
    })
        //success
    builder.addCase(initializeSearch.fulfilled, (state, action) => {
      console.log("received initialize")
      console.log(action.payload)
      console.log("received unsearched")
      console.log(action.payload.unsearchedCoords)
      state.loading = false
      state.nextCenter = action.payload.furthestNearest
      state.searchedCoords = action.payload.searchedCoords
      state.unsearchedCoords = action.payload.unsearchedCoords
      state.searchID = action.payload.searchID.lastRowID
      state.error = ''
    })
        //fail
    builder.addCase(initializeSearch.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message
      state.searchActive = false
    })

    //load search
        //pending
    builder.addCase(syncBackend.pending, (state, action) => {
      console.log("syncBackend started")
    })
        //success
    builder.addCase(syncBackend.fulfilled, (state, action) => {
      console.log("syncBackend fulfilled")
      state.loading = false
      state.error = ''
    })
        //fail
    builder.addCase(syncBackend.rejected, (state, action) => {
      console.log("syncBackend rejected")
      state.loading = false
      state.error = action.error.message
    })

  },
  reducers: {
    loadStateFromFile: (state, action) => {
      console.log("loadStateFromFile running on searchSlice")
      let file = action.payload
      console.log(file)

      state.searchActive = true
      state.searchID = file.searchID
      state.nextCenter = file.nextCenter
      state.lastSearchRadius = file.lastSearchRadius
      state.searchedCoords = file.searchedCoords
      state.unsearchedCoords = file.unsearchedCoords
      state.googleData = file.googleData
    },
    setPriorSearch: (state, action) => {state.priorSearch = action.payload},
    setSearchActive: (state, action) => {state.searchActive = action.payload},
    addSearchCallType: (state, action) => {state.searchCallType = action.payload},
    setSearchReady: (state, action) => {state.searchReady = action.payload},
    setSearchComplete: (state, action) => {state.searchComplete = action.payload},
    setBulkSearchCount: (state, action) => {state.bulkSearchCount = action.payload},
    setBulkSearchMode: (state, action) => {state.bulkSearchMode = action.payload},
    setNearbySearchComplete: (state, action) => {state.nearbySearchComplete = action.payload},
    setSearchData: (state, action) => {
      console.log("setSearchData complete")
      console.log(action.payload)
      state.nearbySearchComplete = true
      state.loading = false
      state.nextCenter = action.payload.apiData.center
      state.searchedCoords = action.payload.apiData.searched
      state.unsearchedCoords = action.payload.apiData.unsearched
      state.googleData = [...state.googleData, ...action.payload.googleData]
    }
  },
})

// export const searchActions = searchSlice.actions
export const {
  addSearchCallType,
  setSearchReady,
  setSearchComplete,
  setBulkSearchCount,
  setBulkSearchMode,
  loadStateFromFile,
  setPriorSearch,
  setSearchData,
  setNearbySearchComplete
} = searchSlice.actions
export default searchSlice.reducer
