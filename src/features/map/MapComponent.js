import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import MapGL, {Source, Layer } from 'react-map-gl'
import Geocoder from "react-map-gl-geocoder";
import { Editor, EditingMode } from 'react-map-gl-draw';
import { getFeatureStyle, getEditHandleStyle } from '../../style';
import { mapActions, deletePolygon } from './mapSlice'
import { SearchInterface } from '../search/SearchInterface'
import { unwrapResult } from '@reduxjs/toolkit'
import { debouncedBuildSearch } from '../../functions/buildSearch'
import { debouncedBulkSearch } from '../../functions/bulkSearch'
import { debouncedSingleSearch } from '../../functions/singleSearch'
import { buildFromFile } from '../../functions/buildFromFile'


const searchedAreaStyle = {
  id: 'searchedAreaLayers',
  type: 'fill',
  source: 'searchedAreas', // reference the data source
  paint: {
        'fill-color': '#0080ff', // blue color fill
        'fill-opacity': 0.5
        }
  }

export const MapComponent = React.forwardRef((props, ref) => {
  const polygons = useSelector(state => state.map.polygonCoordinates)
  const TOKEN='pk.eyJ1IjoiZXNvbGJlcmc3NyIsImEiOiJja3l1ZmpqYWgwYzAxMnRxa3MxeHlvanVpIn0.co7_t1mXkXPRE8BOnOHJXQ'

  // redux
  const dispatch = useDispatch()
  const mapData = useSelector(state => state.map)
  const mapPolygons = mapData.mapPolygons
  const selectedFeatureIndex = mapData.selectedFeatureIndex
  const setSelectedFeatureIndex = mapActions.setSelectedFeatureIndex

  const fileData = useSelector(state => state.loadFile.fileData)
  const sliceSearchedAreas = mapData.searchedAreas
  const searchActive = useSelector(state => state.search.searchActive)
  const priorSearch = useSelector(state => state.search.priorSearch)

  // refs
  const mapRef = useRef();
  const editorRef = useRef();

  // local state
  const [mode, setMode] = useState(undefined);
  const [viewport, setViewPort] = useState({
    width: "100%",
    height: 900,
    latitude: 0,
    longitude: 0,
    zoom: 1,
    transitionDuration: 100
  })

  // callbacks
  const _onViewportChange = viewport => {
    // console.log(viewport)
    setViewPort({...viewport, transitionDuration: 0 })}

  const onSelect = useCallback(options => {
    dispatch(setSelectedFeatureIndex(options && options.selectedFeatureIndex))
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.state.featureCollection.featureCollection.features = []
      editorRef.current.addFeatures(mapPolygons)
    }
  }, [fileData, mapPolygons])

  useEffect(() => {
    setViewPort({
        ...viewport,
        transitionDuration: 0,
        latitude: 42.35573177233323,
        longitude: -71.15248312858093,
        zoom: 10
       })
  }, [])


  function onDelete() {
    dispatch(deletePolygon())
  }

  const onUpdate = useCallback(({editType}) => {
    if (editType === 'addFeature') {
      let data = editorRef.current.getFeatures()
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
        nearbySearch={debouncedSingleSearch}
        buildFromFile={buildFromFile}
        editorRef={editorRef}
        searchActive={searchActive}
        priorSearch={priorSearch}
        bulkSearch={debouncedBulkSearch}
        />
      </div>
    </div>
  )
})
