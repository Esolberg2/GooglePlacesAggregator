import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import MapGL, {GeolocateControl, Source, Layer } from 'react-map-gl'
import DeckGL, { GeoJsonLayer } from "deck.gl";
import Geocoder from "react-map-gl-geocoder";
import { Editor, DrawPolygonMode, EditingMode } from 'react-map-gl-draw';
import { getFeatureStyle, getEditHandleStyle } from '../../style';
import { mapActions } from './mapSlice'
import { SearchInterface } from '../search/SearchInterface'
import { debounce, initializeSearch, nearbySearch, loadStateFromFile, setPriorSearch } from '../search/searchSlice'
import { modalDialog, alertDialog, confirmationDialog } from '../modal/modalSlice'
// import { fileData } from '../loadFile/loadFileSlice'
import { unwrapResult } from '@reduxjs/toolkit'

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
  const polygons = useSelector(state => state.map.polygonCoordinates)
  const TOKEN='pk.eyJ1IjoiZXNvbGJlcmc3NyIsImEiOiJja3l1ZmpqYWgwYzAxMnRxa3MxeHlvanVpIn0.co7_t1mXkXPRE8BOnOHJXQ'

  // redux
  const dispatch = useDispatch()
  const mapData = useSelector(state => state.map)
  const fileData = useSelector(state => state.loadFile.fileData)
  const sliceSearchedAreas = mapData.searchedAreas
  const searchActive = useSelector(state => state.search.searchActive)
  const priorSearch = useSelector(state => state.search.priorSearch)
  // const count = useSelector((state) => state.map.value)
  // console.log(searchActive)
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
      // delete search polygon from Editor object
      await editorRef.current.deleteFeatures(selectedFeatureIndex);
      setSelectedFeatureIndex(null)

      // filter remaining polygons in Editor to aggregate GEOJson only
      let data = editorRef.current.getFeatures()
      // let result = data.map(currentElement => currentElement.geometry.coordinates[0]);

      dispatch(mapActions.setPolygonCoordinates(data))
    }
  }, [selectedFeatureIndex]);

  const onUpdate = useCallback(({editType}) => {
    if (editType === 'addFeature') {
      console.log("adding to polygons")
      let data = editorRef.current.getFeatures()
      // let result = data.map(currentElement => currentElement.geometry.coordinates[0]);
      dispatch(mapActions.setPolygonCoordinates(data))
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


  async function buildFromFile() {
    console.log(editorRef.current)
    console.log(polygons)
    // editorRef.current.addFeatures(fileData.polygons)
    let alert = dispatch(modalDialog({
      "target": () => {dispatch(loadStateFromFile(fileData))},
      "alertKey": "loadFile",
    }))
    .then(unwrapResult)
    .then((res) => {
      console.log(res)
      console.log("thenned")
      console.log(fileData.mapPolygons)
      // editorRef.current.addFeatures(fileData.mapPolygons)
      // editorRef.current.props.features = fileData.mapPolygons
      editorRef.current.state.featureCollection.featureCollection.features = []
      editorRef.current.addFeatures(fileData.mapPolygons)
      // editorRef.current.setState()
      console.log("done")
    })
    .catch(() => {console.log("catchedded")})
    // .then((res) => {
    //   console.log("map componenet fulfilled")
    //   // return res
    //   editorRef.current.addFeatures(fileData.polygons)
    //   return res
    // })
    // .catch((error) => {
    //   console.log("map componenet rejected")
    //   console.log(error)
    //   return error
    // })
    console.log(editorRef)
    console.log(alert)
  }

  function search() {
    dispatch(alertDialog(
      {
        "target": () => {dispatch(nearbySearch())},
        "alertKey": "search"
      }
    ))
  }

  function debouncedSearch() {
    dispatch(debounce(search))
  }

  function buildSearch() {
    dispatch(alertDialog(
      {
        "target": () => {dispatch(initializeSearch())},
        "alertKey": "buildSearch"
      }
    ))
  }

  function debouncedBuildSearch() {
    dispatch(debounce(buildSearch))
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
        setMode={setMode}
        onDelete={onDelete}
        initializeSearch={debouncedBuildSearch}
        nearbySearch={debouncedSearch}
        buildFromFile={buildFromFile}
        editorRef={editorRef}
        searchActive={searchActive}
        priorSearch={priorSearch}
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
