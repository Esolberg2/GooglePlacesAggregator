// import { useRef } from 'react'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as turf from '@turf/turf'


const initialState = {
  searchedAreas: {
    'type': 'FeatureCollection',
    'features': []
    },
  selectedFeatureIndex: null,
  polygonCoordinates: null,
  mapPolygons: []
  // editorRefState: undefined
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

// export const deletePolygon = createAsyncThunk('map/deletePolygon', async (editorRef, b) => {
//   await editorRef.current.deleteFeatures(b.state.selectedFeatureIndex);
//   b.dispatch(setSelectedFeatureIndex(null))
//   let data = editorRef.current.getFeatures()
//   b.dispatch(mapActions.setPolygonCoordinates(data))
// })

export const deletePolygon = createAsyncThunk('map/deletePolygon', (args, b) => {
  let polygons = b.getState().map.mapPolygons
  let index = b.getState().map.selectedFeatureIndex
  let length = polygons.length

  if (index != null) {
    let newPolygons = polygons.slice(0, index).concat(polygons.slice(index+1, length))

    b.dispatch(setPolygonCoordinates(newPolygons))
  }
})

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  extraReducers: {
    ["search/nearbySearch/fulfilled"]: (state, action) => {
      console.log(action.payload)
      state.searchedAreas.features = [...state.searchedAreas.features, buildCoordJSON(action.payload.lastSearchPerimeter)]
    },
    ["loadStateFromFile"]: (state, action) => {
      let file = action.payload
      console.log("map slice loadStateFromFile2")

    },
    ["searchSlice/loadStateFromFile"]: (state, action) => {
      let file = action.payload
      console.log("map slice loadStateFromFile")
      console.log(file)
      // console.log(file.searchedCoords)
      state.polygonCoordinates = file.polygonCoordinates
      state.mapPolygons = file.mapPolygons
      state.searchedAreas = file.searchedAreas
      // state.editorRefState.addFeatures(file.polygons)
    }
  },
  reducers: {
    // setEditorRefState: (state, action) => {state.editorRefState = action.payload},
    setSearchedAreas: (state, action) => {state.searchedAreas.features = action.payload},
    setSelectedFeatureIndex: (state, action) => {state.selectedFeatureIndex = action.payload},
    setPolygonCoordinates: (state, action) => {

      let coords = action.payload.map(currentElement => currentElement.geometry.coordinates[0]);
      state.polygonCoordinates = coords
      state.mapPolygons = action.payload
      state.selectedFeatureIndex = null
    }
  },

})

export const
{
addSearchedAreas,
setSearchedAreas,
setSelectedFeatureIndex,
setPolygonCoordinates,
} = mapSlice.actions

export const mapActions = mapSlice.actions
export default mapSlice.reducer
