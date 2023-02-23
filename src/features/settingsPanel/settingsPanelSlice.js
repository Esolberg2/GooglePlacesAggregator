import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import GoogleApiService from '../../googleAPI/googleApiService';
import { initializeSearch, searchPlaces, loadStateFromFile } from '../search/searchSlice';

const initialState = {
  searchEntityType: 'Select',
  budget: 0,
  budgetUsed: 0,
  searchResolution: 0.7,
  userSearchKey: '',
  apiKey: '',
  apiKeyStale: false,
  googlePlacesLibLoading: false,
  bulkSearchMode: false,
  testMode: true,
};

function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const updateGoogleApi = createAsyncThunk('settingsPanelSlice/updateGoogleApi', async (a, b) => {
  const googleApiService = GoogleApiService.getInstance();
  await googleApiService.updateGoogleApi(b.getState().settingsPanel.apiKey);
});

export const settingsPanelSlice = createSlice({
  name: 'settingsPanel',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(initializeSearch.fulfilled, (state) => {
      const randomKey = makeid(18);
      state.userSearchKey = randomKey;
    });

    builder.addCase(searchPlaces.fulfilled, (state) => {
      state.budgetUsed += 0.032;
    });

    builder.addCase(loadStateFromFile, (state, action) => {
      const file = action.payload;
      state.testMode = file.testMode;
      state.budget = file.budget;
      state.budgetUsed = file.budgetUsed;
      state.searchResolution = file.searchResolution;
      state.searchEntityType = file.searchEntityType;
      state.userSearchKey = file.userSearchKey;
    });

    builder.addCase(updateGoogleApi.pending, (state) => {
      state.googlePlacesLibLoading = true;
    });

    builder.addCase(updateGoogleApi.fulfilled, (state) => {
      state.googlePlacesLibLoading = false;
    });

    builder.addCase(updateGoogleApi.rejected, (state) => {
      state.googlePlacesLibLoading = false;
    });
  },
  reducers: {
    setSearchEntityType: (state, action) => { state.searchEntityType = action.payload; },
    setSearchResolution: (state, action) => { state.searchResolution = action.payload; },
    incrementBudgetUsed: (state) => { state.budgetUsed += 0.032; },
    setBudget: (state, action) => { state.budget = action.payload; },
    setTestMode: (state, action) => { state.testMode = action.payload; },
    setBulkSearchMode: (state, action) => { state.bulkSearchMode = action.payload; },
    setUserSearchKey: (state, action) => { state.userSearchKey = action.payload; },
    setGooglePlacesLibLoading: (state, action) => {
      state.googlePlacesLibLoading = action.payload;
    },
    setApiKey: (state, action) => {
      state.apiKey = action.payload;
    },
    setApiKeyStale: (state, action) => {
      state.apiKeyStale = action.payload;
    },
  },
});

export const settingsPanelActions = settingsPanelSlice.actions;

export default settingsPanelSlice.reducer;
