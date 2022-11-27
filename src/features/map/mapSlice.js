// import { useRef } from 'react'
import { createSlice } from '@reduxjs/toolkit'
import * as turf from '@turf/turf'


const initialState = {
  searchedAreas: {
    'type': 'FeatureCollection',
    'features': []
    },
  selectedFeatureIndex: null,
  polygons: null,
  editorRefState: undefined
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
      console.log(action.payload)
      state.searchedAreas.features = [...state.searchedAreas.features, buildCoordJSON(action.payload.lastSearchPerimeter)]
    },
    ["searchSlice/loadStateFromFile"]: (state, action) => {
      let file = action.payload
      console.log("map slice")
      console.log(file)
      console.log(file.searchedCoords)
      console.log(typeof file)
      state.polygons = file.polygons
      state.searchedAreas = file.searchedAreas
      state.editorRefState.addFeatures(file.polygons)
    }
  },
  reducers: {
    setEditorRefState: (state, action) => {state.editorRefState = action.payload},
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

export const mapActions = mapSlice.actions
export default mapSlice.reducer
