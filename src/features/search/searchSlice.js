import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as turf from '@turf/turf'
import { googlePlacesApiManager } from '../../googleAPI/googlePlacesApiManager'
import { checksumManager } from '../../data/checksumManager'
import { callbackDict, confirmPromise } from '../modal/modalSlice'
import axios from 'axios'

const initialState = {
// == api call meta ==
  loading: false,
  error: '',
  searchActive: false,
  priorSearch: false,

// == api data ==
  searchID: '',
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


// ============= Thunks ==================

// export const setPriorSearch = createAsyncThunk('search/setPriorSearch',(args, b) => {
//
//   if (b.getState().map.polygons.length > 0 || b.getState().search.googleData.length != 0 || b.getState().search.searchedCoords.length != 0 || b.getState().search.unsearchedCoords.length != 0) {
//
//   }
//   if (b.getState().search.loading) {
//     console.log("aborted")
//     b.abort()
//   } else {
//     console.log("allowed")
//     target()
//   }
// })

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
  console.log(polygonCoordinates)

  const searchResolution = b.getState().settingsPanel.searchResolution
  console.log(searchResolution)

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


// export const nearbySearch = createAsyncThunk('search/nearbySearch', async (a, b) => {
//
//
//   let rawGoogleData = await googlePlacesApiManager.nearbySearch()
//
//   if (!rawGoogleData) {
//     b.abort()
//     return false
//   }
//
//   const center = b.getState().search.nextCenter
//   const searchID = b.getState().search.searchID
//   let options = {
//     steps: 20,
//     units: 'miles',
//     options: {}
//   };
//   let polygon = turf.circle(center, rawGoogleData["radius"], options);
//   let searchPerimeter = polygon.geometry.coordinates[0];
//
//   let data = await axios
//   .put(`/api/searchSession`, {
//     "circleCoordinates": searchPerimeter,
//     "searchID": searchID,
//     "checksum": checksumManager.dataChecksum()
//     })
//
//     .then((result) => {
//       return {
//         "lastSearchPerimeter": searchPerimeter,
//         "googleData": rawGoogleData.googleData,
//         "apiData": data.data
//       }
//     })
//     .catch((error) => {
//       console.log("put catch")
//       b.abort()
//       return false
//     })
//   })

// nearby search
export const nearbySearch = createAsyncThunk('search/nearbySearch', async (a, b) => {
  console.log("calling google")
  let rawGoogleData = await googlePlacesApiManager.nearbySearch()
  console.log(rawGoogleData)
  console.log("google called")
  try {
    const center = b.getState().search.nextCenter
    const searchID = b.getState().search.searchID
    let options = {
      steps: 20,
      units: 'miles',
      options: {}
    };
    console.log(center)
    console.log(rawGoogleData)
    let polygon = turf.circle(center, rawGoogleData["radius"], options);
    let searchPerimeter = polygon.geometry.coordinates[0];
    console.log("sent nearby search")
    console.log({
      "circleCoordinates": searchPerimeter,
      "searchID": searchID,
      "checksum": checksumManager.dataChecksum()
      })
    console.log("data bundle done")

    let data = await axios
    .put(`/api/searchSession`, {
      "circleCoordinates": searchPerimeter,
      "searchID": searchID,
      "checksum": checksumManager.dataChecksum()
      })
      .then((result) => {
        return {
          "lastSearchPerimeter": searchPerimeter,
          "googleData": rawGoogleData.googleData,
          "apiData": result.data
        }
        return result
      })
      .catch((error) => {
        console.log("put catch")
        if (error.response.status == 409) {
          b.dispatch(syncBackend())
        } else {

        }
        b.abort()
        return false
      })

      return data
      // console.log("API DATA")
      // console.log(data)
      // console.log("axios call done")
      // // return ["test"]
      // return {
      //   "lastSearchPerimeter": searchPerimeter,
      //   "googleData": rawGoogleData.googleData,
      //   "apiData": data.data
      // }
      // return data.data
  }
  catch (error) {
    console.log(error)
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
    // initialize search
        //pending
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

    // nearby search
        //pending
    builder.addCase(nearbySearch.pending, (state) => {
      state.loading = true
    })
        //success
    builder.addCase(nearbySearch.fulfilled, (state, action) => {
      console.log("received nearby searc")
      console.log(action.payload)
      state.loading = false
      state.error = ''
      state.nextCenter = action.payload.apiData.center
      state.searchedCoords = action.payload.apiData.searched
      state.unsearchedCoords = action.payload.apiData.unsearched
      state.googleData = [...state.googleData, ...action.payload.googleData]
    })
        //fail
    builder.addCase(nearbySearch.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message
    })

    //load search
        //pending
    builder.addCase(syncBackend.pending, (state, action) => {
      state.loading = true
    })
        //success
    builder.addCase(syncBackend.fulfilled, (state, action) => {
      state.loading = false
      state.error = ''
    })
        //fail
    builder.addCase(syncBackend.rejected, (state, action) => {
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
} = searchSlice.actions
export default searchSlice.reducer
