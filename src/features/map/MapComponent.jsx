import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MapGL, {Source, Layer } from 'react-map-gl';
import Geocoder from 'react-map-gl-geocoder';
import { Editor, EditingMode } from 'react-map-gl-draw';
import { getFeatureStyle, getEditHandleStyle } from '../../style';
import { mapActions, deletePolygon } from './mapSlice';
import { SearchInterface } from '../search/SearchInterface';
import debouncedBuildSearch from '../../functions/buildSearch';
import { debouncedBulkSearch, debouncedSingleSearch } from '../search/searchSlice';
import buildFromFile from '../../functions/buildFromFile';

const searchedAreaStyle = {
  id: 'searchedAreaLayers',
  type: 'fill',
  source: 'searchedAreas', // reference the data source
  paint: {
    'fill-color': '#0080ff', // blue color fill
    'fill-opacity': 0.5,
  },
};

function MapComponent() {
  const TOKEN = 'pk.eyJ1IjoiZXNvbGJlcmc3NyIsImEiOiJja3l1ZmpqYWgwYzAxMnRxa3MxeHlvanVpIn0.co7_t1mXkXPRE8BOnOHJXQ';

  const dispatch = useDispatch();

  // map slice
  const mapData = useSelector((state) => state.map);
  const { searchedAreas, mapPolygons } = mapData;
  const { setSelectedFeatureIndex } = mapActions;

  const searchData = useSelector(state => state.search);
  const { searchActive, priorSearch } = searchData;

  const settingsPanel = useSelector(state => state.settingsPanel);
  const { budgetUsed } = settingsPanel;

  // refs
  const mapRef = useRef();
  const geocoderContainerRef = useRef();
  const editorRef = useRef();

  // local state
  const [mode, setMode] = useState(undefined);
  const [viewport, setViewPort] = useState({
    width: '100%',
    height: 900,
    latitude: 0,
    longitude: 0,
    zoom: 1,
    transitionDuration: 100,
  });

  const onViewportChange = (vp) => {
    setViewPort({
      ...vp, transitionDuration: 0,
    });
  };

  const onSelect = useCallback((options) => {
    dispatch(setSelectedFeatureIndex(options && options.selectedFeatureIndex));
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.state.featureCollection.featureCollection.features = [];
      editorRef.current.addFeatures(mapPolygons);
    }
  }, [mapPolygons]);

  useEffect(() => {
    setViewPort({
      ...viewport,
      transitionDuration: 0,
      latitude: 42.35573177233323,
      longitude: -71.15248312858093,
      zoom: 10,
    });
  }, []);

  const onDelete = () => {
    dispatch(deletePolygon());
  };

  const onUpdate = useCallback(({ editType }) => {
    if (editType === 'addFeature') {
      const data = editorRef.current.getFeatures();
      dispatch(mapActions.setPolygonCoordinates(data));
      setMode(new EditingMode());
    }
  }, []);

  const handleViewportChange = useCallback(
    (newViewport) => setViewPort(newViewport),
    [],
  );

  const handleGeocoderViewportChange = useCallback(
    (newViewport) => {
      const geocoderDefaultOverrides = { transitionDuration: 1000 };
      return handleViewportChange({
        ...newViewport,
        ...geocoderDefaultOverrides,
      });
    },
    [handleViewportChange],
  );

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
      }}
    >
      <MapGL
        ref={mapRef}
        {...viewport}
        width="100%"
        height="100%"
        mapboxApiAccessToken={TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onViewportChange={onViewportChange}
      >
        <Geocoder
          mapRef={mapRef}
          containerRef={geocoderContainerRef}
          onViewportChange={handleGeocoderViewportChange}
          mapboxApiAccessToken={TOKEN}
          position="top-right"
        />
        <Source id="searchedAreaLayer" type="geojson" data={searchedAreas}>
          <Layer key="2" {...searchedAreaStyle} />
        </Source>

        <Editor
          ref={editorRef}
          style={{
            width: '100%', height: '100%',
          }}
          clickRadius={12}
          mode={mode}
          onSelect={onSelect}
          onUpdate={onUpdate}
          editHandleShape="circle"
          featureStyle={getFeatureStyle}
          editHandleStyle={getEditHandleStyle}
        />
      </MapGL>
      <div
        style={{
          backdropFilter: 'blur(20px)', borderBottomRightRadius: '10px', position: 'absolute', alingSelf: 'flex-start',
        }}
      >
        <div
          style={{
            fontWeight: 'bold', paddingTop: '10px', display: 'flex', justifyContent: 'center',
          }}
        >
          {'New Search' ? !priorSearch : 'Prior Search'}
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
          budgetUsed={budgetUsed}
        />
      </div>
    </div>
  );
}

export default MapComponent;
