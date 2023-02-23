import { createSlice, createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import * as turf from '@turf/turf';
import axios from 'axios';
import dummyGoogleCall from '../../googleAPI/dummyCall';
import ChecksumManager from '../../data/checksumManager';
import { buildModal } from '../modal/modalSlice';
import GoogleApiService from '../../googleAPI/googleApiService';

const initialState = {
// == api call meta ==
  buildingSearch: false,
  loading: false,
  nearbySearchComplete: false,
  error: '',
  searchActive: false,
  priorSearch: false,
  bulkSearchRunning: false,

  // == api data ==
  searchID: '',
  // lon lat
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
};

export const initializeSearch = createAsyncThunk('searchSlice/initializeSearch', (a, b) => {
  const { polygonCoordinates } = b.getState().map;
  const { searchResolution } = b.getState().settingsPanel;
  window.loadingAbort = b.abort;

  return axios
    .post('/api/searchSession', {
      searchRegions: polygonCoordinates,
      searchID: null,
      coordinateResolution: searchResolution,
    })
    .then((response) => {
      window.loadingAbort = () => undefined;
      return response.data;
    })
    .catch((error) => {
      window.loadingAbort = () => undefined;
      throw new Error(error);
    });
});

export const syncBackend = createAsyncThunk('searchSlice/syncBackend', async (a, b) => {
  const { searchID, searchedCoords, unsearchedCoords } = b.getState().search;

  await axios
    .put('/api/loadSearch', {
      searched: searchedCoords,
      unsearched: unsearchedCoords,
      searchID: searchID,
    })
    .then((result) => result)
    .catch((error) => error.msg);
});

export const singleSearch = createAsyncThunk('searchSlice/singleSearch', async (a, b) => {
  const selectedAction = await buildModal(
    {
      alertKey: 'search',
      data: null,
      confirmCallback: () => b.dispatch(searchPlaces()),
      denyCallback: (error) => {
        throw new Error(error);
      },
    },
    b.getState(),
    b.dispatch,
  );
  const returned = await selectedAction();
  return unwrapResult(returned);
});

export const bulkSearch = createAsyncThunk('searchSlice/bulkSearch', async (a, b) => {
  const selectedAction = await buildModal(
    {
      alertKey: 'bulkSearch',
      data: null,
      confirmCallback: async () => {
        for (let i = 0; i < b.getState().search.bulkSearchCount; i += 1) {
          unwrapResult(await b.dispatch(singleSearch()));
        }
      },
      denyCallback: (error) => {
        throw new Error(error);
      },
    },
    b.getState(),
    b.dispatch,
  );
  await selectedAction();
});

// for testing
// eslint-disable-next-line no-unused-vars
function processGoogleDataForceMismatch(searchID, searchPerimeter) {
  return axios
    .put('/api/searchSession', {
      circleCoordinates: searchPerimeter,
      searchID: searchID,
      checksum: '9999999',
    });
}

function processGoogleData(searchID, searchPerimeter, checksum) {
  return axios
    .put('/api/searchSession', {
      circleCoordinates: searchPerimeter,
      searchID: searchID,
      checksum: checksum,
    });
}

function searchCallback(results, status, kwargs) {
  const zeroResults = 'ZERO_RESULTS';
  const ok = 'OK';
  const {
    testMode,
    nextCenter,
    searchID,
    resolve,
    checksum,
  } = kwargs;

  if (
    testMode
    || status === ok
    || status === zeroResults
  ) {
    results.forEach((item, i) => {
      delete item.opening_hours;
      delete item.permanently_closed;
    });
    const options = { units: 'miles' };
    results = JSON.parse(JSON.stringify(results));

    const testRadius = Math.random() * (1.5 - 0.1) + 0.1;
    const lastLat = results[results.length - 1].geometry.location.lat;
    const lastLon = results[results.length - 1].geometry.location.lng;
    const from = turf.point(nextCenter);
    const to = turf.point([lastLon, lastLat]);
    const radius = testMode ? testRadius : turf.distance(from, to, options);

    const polygon = turf.circle(nextCenter, radius, options);
    const searchPerimeter = polygon.geometry.coordinates[0];

    processGoogleData(searchID, searchPerimeter, checksum)
    // processGoogleDataForceMismatch(searchID, searchPerimeter)
      .then((apiData) => {
        resolve({
          lastSearchPerimeter: searchPerimeter,
          googleData: results,
          apiData: apiData.data,
        });
      })
      .catch((error) => {
        throw new Error(error);
      });
  } else {
    return results;
  }
}

function googleAuthErrorHook(reject, apiKey) {
  const googleApiService = GoogleApiService.getInstance();

  window.gm_authFailure = function () {
    googleApiService.updateGoogleApi(apiKey);

    const selection = window.confirm(
      'Google Maps API failed to load. Please check that your API key is correct'
      + ' and that the key is authorized for Google\'s "Maps JavaScript API" and "Places API".'
      + ' This can be done from the Google Cloud Console.'
      + '\n \n'
      + 'Click "OK" to be taken to the instruction page for creating Google API keys and enabling the required APIs'
      + ' at the below URL:\n \n'
      + 'https://developers.google.com/maps/documentation/javascript/get-api-key',
    );
    if (selection) {
      reject();
      window.open('https://developers.google.com/maps/documentation/javascript/get-api-key', '_blank', 'noopener,noreferrer');
    } else {
      reject();
    }
  };
}

export const searchPlaces = createAsyncThunk('searchSlice/searchPlaces', (a, b) => {
  const { searchedCoords, unsearchedCoords } = b.getState().search;
  const kwargs = {
    coords: b.getState().search.nextCenter,
    searchType: b.getState().settingsPanel.searchEntityType,
    testMode: b.getState().settingsPanel.testMode,
    nextCenter: b.getState().search.nextCenter,
    searchID: b.getState().search.searchID,
    checksum: ChecksumManager.buildChecksum(searchedCoords, unsearchedCoords),
  };

  const origin = { lat: kwargs.coords[1], lng: kwargs.coords[0] };
  const request = {
    location: origin,
    rankBy: 1,
    type: kwargs.searchType,
  };

  return new Promise((resolve, reject) => {
    kwargs.resolve = resolve;
    kwargs.reject = reject;

    googleAuthErrorHook(b.abort, reject, b.getState().search.apiKey);

    if (b.getState().settingsPanel.testMode) {
      try {
        dummyGoogleCall(request, (result, status) => searchCallback(result, status, kwargs));
      } catch (error) {
        throw new Error(error);
      }
    } else {
      const googleApiService = GoogleApiService.getInstance();
      googleApiService.nearbySearch(request, (result, status) => {
        searchCallback(result, status, kwargs);
      });
    }
  })
    .then((result) => result)
    .catch((error) => {
      if (error.response.status === 409) {
        b.dispatch(syncBackend());
      }
      return error;
    });
});

// ============ Reducers ====================
export const searchSlice = createSlice({
  name: 'searchSlice',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(searchPlaces.pending, (state) => {
      state.loading = true;
      state.error = '';
    });
    builder.addCase(searchPlaces.fulfilled, (state, action) => {
      state.loading = false;
      state.error = '';
      state.nearbySearchComplete = true;
      state.nextCenter = action.payload.apiData.center;
      state.searchedCoords = action.payload.apiData.searched;
      state.unsearchedCoords = action.payload.apiData.unsearched;
      state.googleData = [...state.googleData, ...action.payload.googleData];
    });
    builder.addCase(searchPlaces.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(bulkSearch.pending, (state) => {
      state.bulkSearchRunning = true;
      state.error = '';
    });
    builder.addCase(bulkSearch.fulfilled, (state) => {
      state.bulkSearchRunning = false;
    });
    builder.addCase(bulkSearch.rejected, (state) => {
      state.bulkSearchRunning = false;
    });
    builder.addCase(initializeSearch.pending, (state) => {
      state.loading = true;
      state.buildingSearch = true;
      state.searchActive = true;
    });
    builder.addCase(initializeSearch.fulfilled, (state, action) => {
      state.loading = false;
      state.buildingSearch = false;
      state.nextCenter = action.payload.furthestNearest;
      state.searchedCoords = action.payload.searchedCoords;
      state.unsearchedCoords = action.payload.unsearchedCoords;
      state.searchID = action.payload.searchID;
      state.error = '';
    });
    builder.addCase(initializeSearch.rejected, (state, action) => {
      state.loading = false;
      state.buildingSearch = false;
      state.error = action.error.message;
      state.searchActive = false;
    });
    builder.addCase(syncBackend.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(syncBackend.fulfilled, (state) => {
      state.loading = false;
      state.error = '';
    });
    builder.addCase(syncBackend.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
  },
  reducers: {
    loadStateFromFile: (state, action) => {
      const file = action.payload;

      state.searchActive = true;
      state.searchID = file.searchID;
      state.nextCenter = file.nextCenter;
      state.lastSearchRadius = file.lastSearchRadius;
      state.searchedCoords = file.searchedCoords;
      state.unsearchedCoords = file.unsearchedCoords;
      state.googleData = file.googleData;
    },
    setBulkSearchRunning: (state, action) => { state.bulkSearchRunning = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setPriorSearch: (state, action) => { state.priorSearch = action.payload; },
    setSearchActive: (state, action) => { state.searchActive = action.payload; },
    addSearchCallType: (state, action) => { state.searchCallType = action.payload; },
    setSearchReady: (state, action) => { state.searchReady = action.payload; },
    setSearchComplete: (state, action) => { state.searchComplete = action.payload; },
    setBulkSearchCount: (state, action) => { state.bulkSearchCount = action.payload; },
    setBulkSearchMode: (state, action) => { state.bulkSearchMode = action.payload; },
    setNearbySearchComplete: (state, action) => { state.nearbySearchComplete = action.payload; },
  },
});

export const {
  addSearchCallType,
  setSearchReady,
  setSearchComplete,
  setBulkSearchCount,
  setBulkSearchMode,
  loadStateFromFile,
  setPriorSearch,
  setNearbySearchComplete,
  setBulkSearchRunning,
  setLoading,
} = searchSlice.actions;

export default searchSlice.reducer;
