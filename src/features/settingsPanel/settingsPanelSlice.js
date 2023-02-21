import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { googlePlacesApiManager } from '../../googleAPI/googlePlacesApiManager'
import { initializeSearch, searchPlaces, loadStateFromFile } from '../search/searchSlice'

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

export const debouncedUpdateGoogleApi = createAsyncThunk('settingsPanelSlice/debouncedUpdateGoogleApi', async (a, b) => {
  if (!b.getState().settingsPanel.googlePlacesLibLoading) {    
    b.dispatch(settingsPanelActions.setGooglePlacesLibLoading(true));
    await googlePlacesApiManager.updateGoogleApi(b.getState().settingsPanel.apiKey);
  }
});

export const settingsPanelSlice = createSlice({
  name: 'settingsPanel',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(initializeSearch.fulfilled, (state, action) => {
    let randomKey = makeid(18)
    state.userSearchKey = randomKey
  }),

  builder.addCase(searchPlaces.fulfilled, (state, action) => {
    state.budgetUsed += .032
  }),

  builder.addCase(loadStateFromFile, (state, action) => {
    let file = action.payload
    state.testMode = file.testMode
    state.budget = file.budget
    state.budgetUsed = file.budgetUsed
    state.searchResolution = file.searchResolution
    state.searchEntityType = file.searchEntityType
    state.userSearchKey = file.userSearchKey
  }),

  // builder.addCase(debouncedUpdateGoogleApi.pending, (state, action) => {
  //   state.googlePlacesLibLoading = true
  // }),
  builder.addCase(debouncedUpdateGoogleApi.fulfilled, (state, action) => {
    state.googlePlacesLibLoading = false
  }),
  builder.addCase(debouncedUpdateGoogleApi.rejected, (state, action) => {
    state.googlePlacesLibLoading = false
  })
},
  reducers: {
    setSearchEntityType: (state, action) => {state.searchEntityType = action.payload},
    setSearchResolution: (state, action) => {state.searchResolution = action.payload},
    incrementBudgetUsed: (state, action) => {state.budgetUsed = state.budgetUsed + .032},
    setBudget: (state, action) => {state.budget = action.payload},
    setTestMode: (state, action) => {state.testMode = action.payload},
    setBulkSearchMode: (state, action) => {state.bulkSearchMode = action.payload},
    setUserSearchKey: (state, action) => {state.userSearchKey = action.payload},
    setGooglePlacesLibLoading: (state, action) => {state.googlePlacesLibLoading = action.payload},
    setApiKey: (state, action) => {
      state.apiKey = action.payload
    },
    setApiKeyStale: (state, action) => {state.apiKeyStale = action.payload},
  },

})

export const settingsPanelActions = settingsPanelSlice.actions

export default settingsPanelSlice.reducer
