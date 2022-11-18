import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as turf from '@turf/turf'
import { googlePlacesApiManager } from '../../googleAPI/googlePlacesApiManager'
import { checksumManager } from '../../data/checksumManager'

import axios from 'axios'

const initialState = {
// == api call meta ==
  loading: false,
  error: '',

// == api data ==
  searchID: '',
  nextCenter: null,
  lastSearchRadius: null,
  searchedCoords: [],
  unsearchedCoords: [],
  googleData: [],

// == search config ==
  searchCallType: "",
  searchReady: false,
  searchComplete: false,
  bulkSearchCount: 0,
}


// ============= Thunks ==================
export const initializeSearch = createAsyncThunk('search/initializeSearch',(a, b) => {
  const polygons = b.getState().map.polygons
  const searchResolution = b.getState().settingsPanel.searchResolution
  return axios
    .post(`/api/searchSession`, {
    "searchRegions": polygons,
    "searchID": null,
    "coordinateResolution": searchResolution
    })
    .then((response) => response.data)
    .catch((error) => error.msg)
})

export const nearbySearch = createAsyncThunk('search/nearbySearch', async (a, b) => {
  let rawGoogleData = await googlePlacesApiManager.nearbySearch()
  console.log(rawGoogleData)
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

      .then((result) => {return result})
      .catch((error) => error.msg)
      console.log("API DATA")
      console.log(data)
      console.log("axios call done")
      // return ["test"]
      return {
        "lastSearchPerimeter": searchPerimeter,
        "googleData": rawGoogleData.googleData,
        "apiData": data.data
      }
      // return data.data
  }
  catch (error) {
    console.log(error)
  }
})

// ============ Reducers ====================
export const searchSlice = createSlice({
  name: 'searchSlice',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(initializeSearch.pending, (state) => {
      state.loading = true
    })
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

    builder.addCase(initializeSearch.rejected, (state, action) => {
      state.loading = false
      state.data = []
      state.error = action.error.message
    })

    builder.addCase(nearbySearch.pending, (state) => {
      state.loading = true
    })
    builder.addCase(nearbySearch.fulfilled, (state, action) => {
      console.log("received nearby searc")
      console.log(action.payload)
      state.loading = false
      state.error = ''

      state.nextCenter = action.payload.apiData.center
      state.searchedCoords = action.payload.apiData.searched
      state.unsearchedCoords = action.payload.apiData.unsearched
      state.googleData = [...state.googleData, ...action.payload.googleData]

      // update map searched area to include circle perimeter

    })

    builder.addCase(nearbySearch.rejected, (state, action) => {
      state.loading = false
      state.error = action.error.message
    })
  },
  reducers: {
    addSearchCallType: (state, action) => {state.searchCallType = action.payload},
    setSearchReady: (state, action) => {state.searchReady = action.payload},
    setSearchComplete: (state, action) => {state.searchComplete = action.payload},
    setBulkSearchCount: (state, action) => {state.bulkSearchCount = action.payload}
  },
})

export const searchActions = searchSlice.actions
export default searchSlice.reducer
