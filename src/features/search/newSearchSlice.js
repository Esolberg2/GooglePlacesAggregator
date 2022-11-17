import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  searchCallType: "",
  searchReady: false,
  searchComplete: false,
  bulkSearchCount: 0,
}

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
