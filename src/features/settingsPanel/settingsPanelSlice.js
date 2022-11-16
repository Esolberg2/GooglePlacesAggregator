import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  searchEntityType: "Select",
  budget: 0,
  budgetUsed: 0,
  searchResolution: 0.5,
  userSearchKey: '',
  apiKey: '',
  apiKeyStale: false,
  bulkSearchMode: false,
  testMode: true,

}

export const settingsPanelSlice = createSlice({
  name: 'settingsPanel',
  initialState,

  reducers: {
    setSearchEntityType: (state, action) => {state.searchEntityType = action.payload},
  },

})

export const settingsPanelActions = settingsPanelSlice.actions

export default settingsPanelSlice.reducer
