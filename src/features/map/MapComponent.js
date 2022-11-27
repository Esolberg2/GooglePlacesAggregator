import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import MapGL, {GeolocateControl, Source, Layer } from 'react-map-gl'
import DeckGL, { GeoJsonLayer } from "deck.gl";
import Geocoder from "react-map-gl-geocoder";
import { Editor, DrawPolygonMode, EditingMode } from 'react-map-gl-draw';
import { getFeatureStyle, getEditHandleStyle } from '../../style';
import { mapActions } from './mapSlice'
import { SearchInterface } from '../search/SearchInterface'
import { initializeSearch, nearbySearch, loadStateFromFile } from '../search/searchSlice'
import { alertDialog, confirmationDialog } from '../modal/modalSlice'
// import { fileData } from '../loadFile/loadFileSlice'

const searchedAreaStyle = {
  id: 'searchedAreaLayers',
  type: 'fill',
  source: 'searchedAreas', // reference the data source
  paint: {
        'fill-color': '#0080ff', // blue color fill
        'fill-opacity': 0.5
        }
  }

// React.forwardRef((props, ref) => {})
export const MapComponent = React.forwardRef((props, ref) => {

  const TOKEN='pk.eyJ1IjoiZXNvbGJlcmc3NyIsImEiOiJja3l1ZmpqYWgwYzAxMnRxa3MxeHlvanVpIn0.co7_t1mXkXPRE8BOnOHJXQ'

  // redux
  const dispatch = useDispatch()
  const mapData = useSelector(state => state.map)
  const fileData = useSelector(state => state.loadFile.fileData)
  const sliceSearchedAreas = mapData.searchedAreas
  // const count = useSelector((state) => state.map.value)

  // refs
  const mapRef = useRef();
  const editorRef = useRef();

  // local state
  const [mode, setMode] = useState(undefined);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(null);
  const [viewport, setViewPort] = useState({
    width: "100%",
    height: 900,
    latitude: 0,
    longitude: 0,
    zoom: 1,
    transitionDuration: 100
  })

  // callbacks
  const _onViewportChange = viewport => setViewPort({...viewport, transitionDuration: 0 })

  const onSelect = useCallback(options => {
    setSelectedFeatureIndex(options && options.selectedFeatureIndex);
  }, []);

  const onDelete = useCallback( async () => {
    if (selectedFeatureIndex !== null && selectedFeatureIndex >= 0) {
      await editorRef.current.deleteFeatures(selectedFeatureIndex);
      setSelectedFeatureIndex(null)
      dispatch(mapActions.setPolygons(editorRef.current.getFeatures()))
    }
  }, [selectedFeatureIndex]);

  const onUpdate = useCallback(({editType}) => {
    console.log(editType)
    // console.log(editorRef.current.getFeatures())
    if (editType === 'addFeature') {
      // console.log(editorRef.current.getFeatures())
      let data = editorRef.current.getFeatures()
      let result = data.map(currentElement => currentElement.geometry.coordinates[0]);

      dispatch(mapActions.setPolygons(result))
      setMode(new EditingMode());
    }
  }, []);

  const handleViewportChange = useCallback(
    (newViewport) => setViewPort(newViewport),
    []
  );

  const handleGeocoderViewportChange = useCallback(
    (newViewport) => {
      const geocoderDefaultOverrides = { transitionDuration: 1000 };

      return handleViewportChange({
        ...newViewport,
        ...geocoderDefaultOverrides
      });
    },
    [handleViewportChange]
  );


  function buildFromFile() {
    editorRef.current.addFeatures(fileData.polygons)
    let alert = dispatch(alertDialog({
      "target": () => {dispatch(loadStateFromFile(fileData))},
      "alertKey": "loadFile",
    }))
  }

  function search() {
    dispatch(alertDialog(
      {
        "target": () => {dispatch(nearbySearch())},
        "alertKey": "search"
      }
    ))
  }

  function buildSearch() {
    dispatch(alertDialog(
      {
        "target": () => {dispatch(initializeSearch())},
        "alertKey": "buildSearch"
      }
    ))
  }


  return (
    <div style={{display: 'flex', height: '100%', flexDirection: 'column'}}>

      <MapGL
        ref={mapRef}
        {...viewport}
        width="100%"
        height="100%"
        mapboxApiAccessToken={TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onViewportChange={_onViewportChange}
        >

       <Geocoder
          mapRef={mapRef}
          onViewportChange={handleGeocoderViewportChange}
          mapboxApiAccessToken={TOKEN}
          position='top-right'
          />

        <Source id="searchedAreaLayer" type="geojson" data={sliceSearchedAreas}>
          <Layer key={"2"} {...searchedAreaStyle} />
        </Source>

        <Editor
          ref={editorRef}
          style={{width: '100%', height: '100%'}}
          clickRadius={12}
          mode={mode}
          onSelect={onSelect}
          onUpdate={onUpdate}
          editHandleShape={'circle'}
          featureStyle={getFeatureStyle}
          editHandleStyle={getEditHandleStyle}
          />
      </MapGL>
      <div style={{backdropFilter: 'blur(20px)', borderBottomRightRadius: '10px', position: 'absolute', alingSelf: 'flex-start'}}>
        <div style={{fontWeight: 'bold', paddingTop: '10px', display: 'flex', justifyContent: 'center'}}>
          test
        </div>
        <SearchInterface
        setMode = {setMode}
        onDelete = {onDelete}
        initializeSearch = {buildSearch}
        nearbySearch = {search}
        buildFromFile = {buildFromFile}
        editorRef = {editorRef}
        />
      </div>
    </div>
  )
})

// export function MapComponent() {
//   const dispatch = useDispatch()
//   const mapData = useSelector(state => state.map)
//   const sliceSearchedAreas = mapData.searchedAreas
//
//   const count = useSelector((state) => state.map.value)
//   const mapRef = useRef();
//   const _onViewportChange = viewport => setViewPort({...viewport, transitionDuration: 0 })
//   const editorRef = useRef(undefined);
//   const [mode, setMode] = useState(undefined);
//   const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(undefined);
//
//   const onSelect = useCallback(options => {
//     setSelectedFeatureIndex(options && options.selectedFeatureIndex);
//   }, []);
//
//   const onDelete = useCallback(() => {
//     if (selectedFeatureIndex !== null && selectedFeatureIndex >= 0) {
//       editorRef.current.deleteFeatures(selectedFeatureIndex);
//     }
//   }, [selectedFeatureIndex]);
//
//   const onUpdate = useCallback(({editType}) => {
//     if (editType === 'addFeature') {
//       setMode(new EditingMode());
//     }
//   }, []);
//
//   const handleViewportChange = useCallback(
//     (newViewport) => setViewPort(newViewport),
//     []
//   );
//
//   const handleGeocoderViewportChange = useCallback(
//     (newViewport) => {
//       const geocoderDefaultOverrides = { transitionDuration: 1000 };
//
//       return handleViewportChange({
//         ...newViewport,
//         ...geocoderDefaultOverrides
//       });
//     },
//     [handleViewportChange]
//   );
//
//   const TOKEN='pk.eyJ1IjoiZXNvbGJlcmc3NyIsImEiOiJja3l1ZmpqYWgwYzAxMnRxa3MxeHlvanVpIn0.co7_t1mXkXPRE8BOnOHJXQ'
//
//
//   const [viewport, setViewPort] = useState({
//     width: "100%",
//     height: 900,
//     latitude: 0,
//     longitude: 0,
//     zoom: 1,
//     transitionDuration: 100
//   })
//
//
//   return (
//     <div style={{height: '100%'}}>
//     <MapGL
//       ref={mapRef}
//       {...viewport}
//       width="100%"
//       height="100%"
//       mapboxApiAccessToken={TOKEN}
//       mapStyle="mapbox://styles/mapbox/streets-v11"
//       onViewportChange={_onViewportChange}
//       >
//
//      <Geocoder
//         mapRef={mapRef}
//         onViewportChange={handleGeocoderViewportChange}
//         mapboxApiAccessToken={TOKEN}
//         position='top-right'
//         />
//
//       <Source id="searchedAreaLayer" type="geojson" data={sliceSearchedAreas}>
//         <Layer key={"2"} {...searchedAreaStyle} />
//       </Source>
//
//       <Editor
//         ref={editorRef}
//         style={{width: '100%', height: '100%'}}
//         clickRadius={12}
//         mode={mode}
//         onSelect={onSelect}
//         onUpdate={onUpdate}
//         editHandleShape={'circle'}
//         featureStyle={getFeatureStyle}
//         editHandleStyle={getEditHandleStyle}
//         />
//     </MapGL>
//     </div>
//   )
// }
