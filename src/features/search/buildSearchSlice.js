import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  loading: false,
  data: [],
  error: '',
}


// export async function axiosPutPostData(method, url = '', data = {}) {
//
//   const replacer = (key, value) => typeof value === 'undefined' ? null : value;
//   let axiosArgs = {
//     method: method,
//     url: url,
//     data: data
//   }
//
//   let result = await axios(axiosArgs)
//   // console.log('baz')
//   // console.log(result)
//   return result
// }
//
// export async function buildSearch(polygons, searchResolution, searchType, testMode) {
//       // get coordinate data
//       let response = await axiosPutPostData('POST', `/api/searchSession`,
//         {
//           "searchRegions": polygons,
//           "searchID": null,
//           "coordinateResolution": searchResolution
//         })
//           let searchedData = response["data"]["searchedCoords"]
//           let unsearchedData = response["data"]["unsearchedCoords"]
//           let nextCenter = response["data"]["furthestNearest"]
//           let searchID = response["data"]["searchID"]["lastRowID"]
//
//           return {
//               "searchedData": searchedData,
//               "unsearchedData": unsearchedData,
//               "nextCenter": nextCenter,
//               "searchID": searchID,
//             }
// }

// export const initializeSearch = createAsyncThunk(
//   'buildSearch/initializeSearch',
//   async (a, b) => {
//   const polygons = b.getState().map.polygons
//   const searchResolution = b.getState().settingsPanel.searchResolution
//   axios
//     .post(`/api/searchSession`, {
//     "searchRegions": polygons,
//     "searchID": null,
//     "coordinateResolution": searchResolution
//     })
//     .then((response) => response.data)
// })

export const initializeSearch = createAsyncThunk('buildSearch/initializeSearch',(a, b) => {
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

export const buildSearchSlice = createSlice({
  name: 'buildSearch',
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

export const buildSearchActions = buildSearchSlice.actions
export default buildSearchSlice.reducer
