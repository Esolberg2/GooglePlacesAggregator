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
  googlePlacesLibLoading: false,
  bulkSearchMode: false,
  testMode: true,

}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const settingsPanelSlice = createSlice({
  name: 'settingsPanel',
  initialState,
  extraReducers: {
    ["search/initializeSearch/fulfilled"]: (state) => {
      let randomKey = makeid(18)
      state.userSearchKey = randomKey
    },
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
    setApiKey: (state, action) => {
      console.log(action.payload)
      state.apiKey = action.payload
    },
    setApiKeyStale: (state, action) => {state.apiKeyStale = action.payload},
    setGooglePlacesLibLoading: (state, action) => {state.googlePlacesLibLoading = action.payload}
  },

})

export const settingsPanelActions = settingsPanelSlice.actions

export default settingsPanelSlice.reducer
