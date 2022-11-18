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


// {
//     "type": "Feature",
//     "properties": {},
//     "geometry": {
//         "type": "Polygon",
//         "coordinates": [
//             [
//                 [
//                     -70.59081885682589,
//                     43.683878931363544
//                 ],
//                 [
//                     -70.59466971041931,
//                     43.68343779622807
//                 ],
//                 [
//                     -70.59814345934286,
//                     43.68215759056885
//                 ],
//                 [
//                     -70.60089997228766,
//                     43.68016367791517
//                 ],
//                 [
//                     -70.6026694226166,
//                     43.67765129574792
//                 ],
//                 [
//                     -70.6032787008297,
//                     43.674866421591894
//                 ],
//                 [
//                     -70.6026683227856,
//                     43.6720816766686
//                 ],
//                 [
//                     -70.60089819272369,
//                     43.66956963283703
//                 ],
//                 [
//                     -70.59814167977886,
//                     43.66757613838927
//                 ],
//                 [
//                     -70.59466861058824,
//                     43.666296271065754
//                 ],
//                 [
//                     -70.59081885682589,
//                     43.665855265163025
//                 ],
//                 [
//                     -70.58696910306354,
//                     43.666296271065754
//                 ],
//                 [
//                     -70.58349603387292,
//                     43.66757613838927
//                 ],
//                 [
//                     -70.58073952092809,
//                     43.66956963283703
//                 ],
//                 [
//                     -70.57896939086618,
//                     43.6720816766686
//                 ],
//                 [
//                     -70.57835901282206,
//                     43.674866421591894
//                 ],
//                 [
//                     -70.57896829103517,
//                     43.67765129574792
//                 ],
//                 [
//                     -70.5807377413641,
//                     43.68016367791517
//                 ],
//                 [
//                     -70.5834942543089,
//                     43.68215759056885
//                 ],
//                 [
//                     -70.58696800323247,
//                     43.68343779622807
//                 ],
//                 [
//                     -70.59081885682589,
//                     43.683878931363544
//                 ]
//             ]
//         ]
//     }
// }
// function buildCoord(center) {
//   var options = {
//     steps: 20,
//     units: 'miles',
//     options: {}
//   };
//   var radius = .035;
//   var polygon = turf.circle(center, radius, options);
//   return polygon
// }

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
