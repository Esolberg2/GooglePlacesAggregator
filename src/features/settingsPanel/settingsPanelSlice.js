import { createSlice } from '@reduxjs/toolkit'
// import { nearbySearch } from '../search/searchSlice'

const initialState = {
  searchEntityType: "Select",
  budget: 0,
  budgetUsed: 0,
  searchResolution: 0.7,
  userSearchKey: '',
  apiKey: '',
  apiKeyStale: false,
  bulkSearchMode: false,
  testMode: true,

}

export const settingsPanelSlice = createSlice({
  name: 'settingsPanel',
  initialState,
  extraReducers: {
    ["search/nearbySearch/fulfilled"]: (state) => {state.budgetUsed += .032},
    ["searchSlice/loadStateFromFile"]: (state, action) => {
      let file = action.payload

      state.budget = file.budget
      state.budgetUsed = file.budgetUsed
      state.searchResolution = file.searchResolution
      state.searchEntityType = file.searchEntityType
      state.userSearchKey = file.userSearchKey
    },

  },
  reducers: {
    setSearchEntityType: (state, action) => {state.searchEntityType = action.payload},
    setSearchResolution: (state, action) => {state.searchResolution = action.payload},
    incrementBudgetUsed: (state, action) => {state.budgetUsed = state.budgetUsed + .032},
    setBudget: (state, action) => {state.budget = action.payload},
    setTestMode: (state, action) => {state.testMode = action.payload},
    setBulkSearchMode: (state, action) => {state.bulkSearchMode = action.payload},
    setUserSearchKey: (state, action) => {state.userSearchKey = action.payload},
    setApiKey: (state, action) => {state.apiKey = action.payload},


  },

})

export const settingsPanelActions = settingsPanelSlice.actions

export default settingsPanelSlice.reducer
