import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as turf from '@turf/turf'
import { googlePlacesApiManager } from '../../googleAPI/googlePlacesApiManager'
import { dummyGoogleCall } from '../../googleAPI/dummyCall.js'
// import { ModalBuilder } from '../modal/ModalBuilder'
import { store } from '../../store'

import { checksumManager } from '../../data/checksumManager'
import { callbackDict, confirmPromise } from '../modal/modalSlice'
import axios from 'axios'
import { singleSearch as modalSingleSearch } from '../../functions/singleSearch'
const initialState = {
// == api call meta ==
  loading: false,
  nearbySearchComplete: false,
  error: '',
  searchActive: false,
  priorSearch: false,
  bulkSearchRunning: false,

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

export const initializeSearch = createAsyncThunk('searchSlice/initializeSearch',(a, b) => {
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


// function searchCallback(results, status, thunkAPI, resolve){
//
//   let testMode = thunkAPI.getState().settingsPanel.testMode
//   if (testMode || status == window.google.maps.places.PlacesServiceStatus.OK) {
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
//         resolve({
//           "lastSearchPerimeter": searchPerimeter,
//           "googleData": results,
//           "apiData": apiData.data
//         })
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
// }

// results, status, thunkAPI, resolve

function searchCallback(results, status, kwargs){
const {
  testMode,
  nextCenter,
  searchID,
  resolve,
  reject
} = kwargs

  if (testMode || status == window.google.maps.places.PlacesServiceStatus.OK) {
    results.forEach((item, i) => {
      delete item.opening_hours
      delete item.permanently_closed
    });

    results = JSON.parse(JSON.stringify(results))
    let testRadius = Math.random() * (1.5 - .1) + .1;
    let lastLat = results[results.length-1].geometry.location.lat
    let lastLon = results[results.length-1].geometry.location.lng

    let from = turf.point(nextCenter);
    let to = turf.point([lastLon, lastLat]);
    let options = {units: 'miles'};
    let radius = testMode ? testRadius : turf.distance(from, to, options);
    let polygon = turf.circle(nextCenter, radius, options);
    let searchPerimeter = polygon.geometry.coordinates[0];

    processGoogleData(searchID, searchPerimeter)
    // processGoogleDataForceMismatch(searchID, searchPerimeter)
      .then((apiData) => {
        resolve({
          "lastSearchPerimeter": searchPerimeter,
          "googleData": results,
          "apiData": apiData.data
        })
      })
      .catch((error) => {
        reject(error)
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

function processGoogleDataForceMismatch(searchID, searchPerimeter) {
    let options = {
      steps: 20,
      units: 'miles',
      options: {}
    };
    return axios
      .put(`/api/searchSession`, {
        "circleCoordinates": searchPerimeter,
        "searchID": searchID,
        "checksum": '9999999'
      })
    }

// export const searchPlaces = createAsyncThunk('searchSlice/searchPlaces', (a, b) => {
//   console.log(b)
//   const outerResolve = a.resolve
//   const outerReject = a.reject
//   let coords = b.getState().search.nextCenter;
//   let searchType = b.getState().settingsPanel.searchEntityType;
//   let origin = {lat: coords[1], lng: coords[0]};
//   let request = {
//     location: origin,
//     rankBy: 1,
//     type: searchType
//     };
//
//   new Promise((resolve, reject) => {
//     if (b.getState().settingsPanel.testMode) {
//       dummyGoogleCall(request, (result, status) => searchCallback(result, status, b, resolve))
//     }
//     else {
//       let service = googlePlacesApiManager.service
//       let func = service.nearbySearch
//       service.nearbySearch(request, (result, status) => searchCallback(result, status, b, resolve));
//     }
//   })
//   .then((out) => {
//     console.log(out)
//     outerResolve(out)
//   })
//   .catch((error) => {
//     console.log(error)
//     outerReject(error)
//     b.abort()
//   })
// })

// export const searchPlaces = (kwargs) => new Promise ((resolve, reject) => {
//
//   kwargs['resolve'] = resolve
//   kwargs['reject'] = reject
//
//   const {
//     coords,
//     testMode,
//     nextCenter,
//     searchID,
//     searchType,
//   } = kwargs
//
//   console.log(kwargs)
//
//   let origin = {lat: coords[1], lng: coords[0]};
//   let request = {
//     location: origin,
//     rankBy: 1,
//     type: searchType
//     };
//
//
//   if (testMode) {
//     dummyGoogleCall(request, (result, status) => searchCallback(result, status, kwargs))
//   }
//   else {
//     let service = googlePlacesApiManager.service
//     let func = service.nearbySearch
//     service.nearbySearch(request, (result, status) => searchCallback(result, status, kwargs));
//   }
// })


export const searchPlaces = createAsyncThunk('searchSlice/searchPlaces', (a, b) => {

  let kwargs = {
    coords: b.getState().search.nextCenter,
    searchType: b.getState().settingsPanel.searchEntityType,
    testMode: b.getState().settingsPanel.testMode,
    nextCenter: b.getState().search.nextCenter,
    searchID: b.getState().search.searchID,
  }

  let origin = {lat: kwargs.coords[1], lng: kwargs.coords[0]};
  let request = {
    location: origin,
    rankBy: 1,
    type: kwargs.searchType
    };

  return new Promise((resolve, reject) => {
    kwargs['resolve'] = resolve
    kwargs['reject'] = reject

    if (b.getState().settingsPanel.testMode) {
      dummyGoogleCall(request, (result, status) => searchCallback(result, status, kwargs))
    }
    else {
      let service = googlePlacesApiManager.service
      let func = service.nearbySearch
      service.nearbySearch(request, (result, status) => searchCallback(result, status, kwargs));
    }
  })
  // .then((out) => {
  //   console.log(out)
  //   outerResolve(out)
  // })
  // .catch((error) => {
  //   console.log(error)
  //   outerReject(error)
  //   b.abort()
  // })
})


// thunk should contain searchPlaces

// const synchronizedCall = (target, dispatch) => new Promise(async (resolve, reject) => {
//   console.log("synchronizedCall")
//   await dispatch(target({resolve: resolve, reject: reject}))
// })


// export async function search(count=1) {
//   for (let i=0; i < count; i++) {
//     let modalBuilder = new ModalBuilder()
//     modalBuilder.alertKey = 'search'
//
//     modalBuilder.callback = () => {
//       console.log("singleSearch modal callback")
//       store.dispatch(searchPlaces())
//       .unwrap()
//       .then((results) => {
//         console.log(i, "singleSearch callback result")
//         console.log(results)
//       })
//       .catch((error) => {
//         console.log("singleSearch callback error")
//         console.log(error)
//         if (error.message == "Request failed with status code 409") {
//           store.dispatch(syncBackend())
//         }
//       })
//     }
//
//     modalBuilder.errorback = (error) => {
//       console.log("singleSearch modal error")
//       console.log(error)
//       }
//
//     let modalBuilderRun = await modalBuilder.run()
//
//     console.log(i, "should run after singleSearch callback")
//   }
// }


// export async function search(count=1) {
//   for (let i=0; i < count; i++) {
//     let modalBuilder = new ModalBuilder()
//     modalBuilder.alertKey = 'search'
//
//     modalBuilder.callback = () => {
//       console.log("singleSearch modal callback")
//       store.dispatch(searchPlaces())
//     }
//
//     modalBuilder.errorback = (error) => {
//       console.log("singleSearch modal error")
//       console.log(error)
//       }
//
//     let modalBuilderRun = modalBuilder.run()
//     console.log(modalBuilderRun)
//     // .then((results) => {
//     //   console.log(i, "singleSearch callback result")
//     //   console.log(results)
//     // })
//     // .catch((error) => {
//     //   console.log("singleSearch callback error")
//     //   console.log(error)
//     //   if (error.message == "Request failed with status code 409") {
//     //     store.dispatch(syncBackend())
//     //   }
//     // })
//
//     console.log(i, "should run after singleSearch callback")
//   }
// }

// export const search = () => {
//   let modalBuilder = new ModalBuilder()
//   modalBuilder.alertKey = 'search'
//
//   modalBuilder.callback = () => {
//     console.log("singleSearch modal callback")
//     store.dispatch(searchPlaces())
//     .unwrap()
//     .then((results) => {
//       console.log("singleSearch callback result")
//       console.log(results)
//     })
//     .catch((error) => {
//       console.log("singleSearch callback error")
//       console.log(error)
//       if (error.message == "Request failed with status code 409") {
//         store.dispatch(syncBackend())
//       }
//     })
//   }
//
//   modalBuilder.errorback = (error) => {
//     console.log("singleSearch modal error")
//     console.log(error)
//     }
//
//   let modalBuilderRun = modalBuilder.run()
//   console.log("modalBuilderRun")
//   console.log(modalBuilderRun)
// }


// export const singleSearch = createAsyncThunk('searchSlice/singleSearch', async (a, b) => {
//   console.log("singleSearch")
//   let kwargs = {
//     coords: b.getState().search.nextCenter,
//     searchType: b.getState().settingsPanel.searchEntityType,
//     testMode: b.getState().settingsPanel.testMode,
//     nextCenter: b.getState().search.nextCenter,
//     searchID: b.getState().search.searchID,
//   }
//
//   let modalBuilder = new ModalBuilder()
//   modalBuilder.alertKey = 'search'
//   modalBuilder.callback = () => {
//     console.log("singleSearch modal callback")
//     searchPlaces(kwargs)
//     .then((results) => {
//       console.log("singleSearch callback result")
//       console.log(results)
//       b.fulfillWithValue(results)
//     })
//     .catch((error) => {
//       console.log("singleSearch callback error")
//       console.log(error)
//       b.rejectWithValue(error)
//     })
//   }
//   modalBuilder.errorback = (error) => {
//     console.log("singleSearch modal error")
//     console.log(error)
//     }
//
//   let modalBuilderRun = await modalBuilder.run()
//   console.log("modalBuilderRun")
//   console.log(modalBuilderRun)
//
// })

// export const bulkSearch = createAsyncThunk('searchSlice/bulkSearch', async (a, b) => {
//   console.log('bulkSearch thunk run')
//   for (let i=0; i < b.getState().search.bulkSearchCount; i++) {
//     await synchronizedCall(searchPlaces, b.dispatch)
//   }
// })

// export const bulkSearch = createAsyncThunk('searchSlice/bulkSearch', async (a, b) => {
//   for (let i=0; i < b.getState().search.bulkSearchCount; i++) {
//         modalSingleSearch()
//         .then(() => {})
//         .catch(() => {
//           console.log("cascading reject")
//           b.abort()
//         })
//         console.log("    single search done")
//       }
// })

// load search
export const syncBackend = createAsyncThunk('searchSlice/syncBackend', async (a, b) => {
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
    // builder.addCase(bulkSearch.pending, (state, action) => {
    //   state.bulkSearchRunning = true
    // })
    // builder.addCase(bulkSearch.fulfilled, (state, action) => {
    //   state.bulkSearchRunning = false
    // })
    // builder.addCase(bulkSearch.rejected, (state, action) => {
    //   state.bulkSearchRunning = false
    // })

    builder.addCase(searchPlaces.pending, (state, action) => {
      state.loading = true
      state.error = ''
    })

    // used to be searchPlaces
    builder.addCase(searchPlaces.fulfilled, (state, action) => {
      console.log(action.payload)
      state.loading = false
      state.error = ''

      state.nearbySearchComplete = true
      state.nextCenter = action.payload.apiData.center
      state.searchedCoords = action.payload.apiData.searched
      state.unsearchedCoords = action.payload.apiData.unsearched
      state.googleData = [...state.googleData, ...action.payload.googleData]

    })
    builder.addCase(searchPlaces.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message
    })

    // builder.addCase(singleSearch.pending, (state, action) => {
    //   state.loading = true
    //   state.error = ''
    // })
    //
    // // used to be searchPlaces
    // builder.addCase(singleSearch.fulfilled, (state, action) => {
    //   console.log(action.payload)
    //   state.loading = false
    //   state.error = ''
    //
    //   state.nearbySearchComplete = true
    //   state.nextCenter = action.payload.apiData.center
    //   state.searchedCoords = action.payload.apiData.searched
    //   state.unsearchedCoords = action.payload.apiData.unsearched
    //   state.googleData = [...state.googleData, ...action.payload.googleData]
    //
    // })
    // builder.addCase(singleSearch.rejected, (state, action) => {
    //   state.loading = false
    //   state.error = action.error.message
    // })

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
    setBulkSearchRunning: (state, action) => {state.bulkSearchRunning = action.payload},
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
  setNearbySearchComplete,
  setBulkSearchRunning
} = searchSlice.actions
export default searchSlice.reducer
