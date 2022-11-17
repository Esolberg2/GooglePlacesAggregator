import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { googlePlacesApiManager } from '../../googleAPI/googlePlacesApiManager'
import axios from 'axios'

const initialState = {
  loading: false,
  data: [],
  error: '',
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
})

export const nearbySearch = createAsyncThunk('search/nearbySearch',(a, b) => {
  let rawGoogleData = googlePlacesApiManager()
  return axios
    .post(`/api/searchSession`, {
    "searchRegions": null,
    "searchID": null,
    "coordinateResolution": null
    })
    .then((response) => response.data)
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
      state.loading = false
      state.data = action.payload
      state.error = ''
    })
    builder.addCase(initializeSearch.rejected, (state, action) => {
      state.loading = false
      state.data = []
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
