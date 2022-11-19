import { createSlice } from '@reduxjs/toolkit'
import * as turf from '@turf/turf'


const initialState = {
  searchedAreas: {
    'type': 'FeatureCollection',
    'features': []
    },
  selectedFeatureIndex: null,
  polygons: null,
}


function buildCoordJSON(coords) {
  return {
    'type': 'Feature',
    'geometry': {
      'coordinates': [coords],
      'type': 'Polygon'
      }
  }
}

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  extraReducers: {
    ["search/nearbySearch/fulfilled"]: (state, action) => {

      state.searchedAreas.features = [...state.searchedAreas.features, buildCoordJSON(action.payload.lastSearchPerimeter)]
    }
  },
  reducers: {
    setSearchedAreas: (state, action) => {state.searchedAreas.features = action.payload},
    setSelectedFeatureIndex: (state, action) => {state.setSelectedFeatureIndex = action.payload},
    setPolygons: (state, action) => {state.polygons = action.payload}
  },

})

export const
{
addSearchedAreas,
setSearchedAreas,
setSelectedFeatureIndex,
setPolygons,
} = mapSlice.actions

export default mapSlice.reducer
