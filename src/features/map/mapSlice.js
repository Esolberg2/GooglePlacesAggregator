import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  searchedAreas: {
    'type': 'FeatureCollection',
    'features': []
    },
  selectedFeatureIndex: null,
  polygons: null,
}

export const mapSlice = createSlice({
  name: 'map',
  initialState,

  reducers: {
    addSearchedAreas: (state, action) => {state.searchedAreas.features = [...state.features, ...action.payload]},
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
