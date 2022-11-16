import { createSlice } from '@reduxjs/toolkit'
import {initializeSearch} from './buildSearchSlice'
const initialState = {
  searchCallType: "",
  searchReady: false,
  searchComplete: false,
  bulkSearchCount: 0,
  data: {
    searchedData: [],
    unsearchedData: [],
    nextCenter: null,
    searchCentroid: null,
    searchID: null,
  }
}

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  extraReducers: (builder) => {

    builder.addCase(initializeSearch.fulfilled, (state, action) => {
      state.data.searchedData = action.payload.searchedCoords
      state.data.unsearchedData = action.payload.unsearchedCoords
      state.data.nextCenter = action.payload.furthestNearest
      state.data.searchCentroid = action.payload.furthestNearest
      state.data.searchID = action.payload.searchID.lastRowID
    })

  },
  reducers: {
    addSearchCallType: (state, action) => {state.searchCallType = action.payload},
    setSearchReady: (state, action) => {state.searchReady = action.payload},
    setSearchComplete: (state, action) => {state.searchComplete = action.payload},
    setBulkSearchCount: (state, action) => {state.bulkSearchCount = action.payload},
    setData: (state, action) => {state.data = action.payload},
  },

})

export const searchActions = searchSlice.actions

export default searchSlice.reducer
