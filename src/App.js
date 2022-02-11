import React, { useEffect, useRef, useState, useCallback } from 'react'
import MapGL, {GeolocateControl, Source, Layer } from 'react-map-gl'
import DeckGL, { GeoJsonLayer } from "deck.gl";
import Geocoder from "react-map-gl-geocoder";
import {Editor, DrawPolygonMode, EditingMode} from 'react-map-gl-draw';
import ControlPanel from './control-panel';
import {getFeatureStyle, getEditHandleStyle} from './style';
import * as turf from '@turf/turf'

// import config from '../config'
import 'mapbox-gl/dist/mapbox-gl.css'
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css"

const TOKEN='pk.eyJ1IjoiZXNvbGJlcmc3NyIsImEiOiJja3l1ZmpqYWgwYzAxMnRxa3MxeHlvanVpIn0.co7_t1mXkXPRE8BOnOHJXQ'

const geolocateStyle = {
  float: 'left',
  margin: '50px',
  padding: '10px'
};


const App = () => {



  // var center_orig = [20.659698486328125, -103.349609375];
  // var center = [-103.349609375, 20.659698486328125];
  var center = [-71.0582912, 42.3602534];
  var options = {
    steps: 5,
    units: 'kilometers',
    options: {}
  };
  var radius = 10;
  var polygon = turf.circle(center, radius, options);
  // console.log(polygon.geometry.coordinates)


  function buildCircleGeoJSON(lat, long, radius) {
    let center = [lat, long]
    let options = {
      steps: 5,
      units: 'miles',
      options: {}
    };
    let polygon = turf.circle(center, radius, options);
    return {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': polygon.geometry.coordinates
        }
    }
  }

  async function putPostData(method, url = '', data = {}) {
    const response = await fetch(url, {
      method: method, // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  function createSession(name) {
    putPostData('POST', '/session', {"name": name, "regions": getPolygons()}).then(data => {
      console.log("test:", data);
    })
  }

  function searchAllSessions() {
    fetch('/test', {method: 'GET'}).then(res => res.json()).then(data => {
      console.log(data);
      for (let row in data["returned"]) {
        console.log(row)
      }
    })
  }


  function setValue() {
    putPostData('POST', `/setUserSearch`, {"searchRegions": getPolygons(), "searchKey": "1234512"}).then(data => {
      console.log(data)
    })
  }

  function getValue(value) {
    fetch(`/get/test/${value}`, {method: 'GET'}).then(res => res.text()).then(data => {
      console.log(data);
    })
  }

  function getSessionDetails(key) {
    fetch(`/session/${key}`, {method: 'GET'}).then(res => res.json()).then(data => {
      console.log(data);
    })
  }

// ------------------------------------------

const mainStyle = {
id: 'maine',
type: 'fill',
source: 'maine', // reference the data source
layout: {},
paint: {
'fill-color': '#0080ff', // blue color fill
'fill-opacity': 0.5
}
}

const mainData2 = {
'type': 'FeatureCollection',
'features': []
}

const mainData3 = {
'type': 'FeatureCollection',
'features': [
{
'type': 'Feature',
'geometry': {
'type': 'Polygon',
'coordinates': [
[
[-67.13734, 45.13745],
[-66.96466, 44.8097],
[-68.03252, 44.3252],
[-69.06, 43.98],
[-70.11617, 43.68405],
[-70.64573, 43.09008],
[-70.75102, 43.08003],
[-70.79761, 43.21973],
[-70.98176, 43.36789],
[-70.94416, 43.46633],
[-71.08482, 45.30524],
[-70.66002, 45.46022],
[-70.30495, 45.91479],
[-70.00014, 46.69317],
[-69.23708, 47.44777],
[-68.90478, 47.18479],
[-68.2343, 47.35462],
[-67.79035, 47.06624],
[-67.79141, 45.70258],
[-67.13734, 45.13745]
]
]
}
},
{
'type': 'Feature',
'geometry': {
'type': 'Polygon',
'coordinates': polygon.geometry.coordinates
}
}
]
}

const [circleLayers, setCircleLayers] = useState([])

// console.log(mainData3.features)

function buildLayers() {
  for (let feature in mainData3.features) {
    setCircleLayers([...circleLayers, <Layer key={feature} {...mainStyle} />])
  }
}


  const [viewport, setViewPort] = useState({
    width: "100%",
    height: 900,
    latitude: 0,
    longitude: 0,
    zoom: 1,
    transitionDuration: 100
  })

  const [searchResultLayer, setSearchResult ] = useState(null)
  const [mode, setMode] = useState(null);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(null);

  const editorRef = useRef(null);
  const mapRef = useRef()

  const onSelect = useCallback(options => {
    setSelectedFeatureIndex(options && options.selectedFeatureIndex);
  }, []);

  const onDelete = useCallback(() => {
    if (selectedFeatureIndex !== null && selectedFeatureIndex >= 0) {
      editorRef.current.deleteFeatures(selectedFeatureIndex);
    }
  }, [selectedFeatureIndex]);

  const onUpdate = useCallback(({editType}) => {
    if (editType === 'addFeature') {
      setMode(new EditingMode());
    }
  }, []);

  const handleOnResult = event => {
    console.log(event.result)
    setSearchResult( new GeoJsonLayer({
        id: "search-result",
        data: event.result.geometry,
        getFillColor: [255, 0, 0, 128],
        getRadius: 1000,
        pointRadiusMinPixels: 10,
        pointRadiusMaxPixels: 10
      })
    )
  }

  function getPolygons() {
    let data = editorRef.current.getFeatures()
    console.log(data)
    let result = data.map(currentElement => currentElement.geometry.coordinates[0]);
    console.log(result)
    return result
  }

  const handleGeocoderViewportChange = viewport => {
    const geocoderDefaultOverrides = { transitionDuration: 1000 };
    console.log("Updating")

    return setViewPort({
      ...viewport,
      ...geocoderDefaultOverrides
    });
  }

  const drawTools = (
    <div className="mapboxgl-ctrl-top-left">
      <div className="mapboxgl-ctrl-group mapboxgl-ctrl">
        <button
          className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_polygon"
          title="Polygon tool (p)"
          onClick={() => setMode(new DrawPolygonMode())}
        />
        <button
          className="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash"
          title="Delete"
          onClick={onDelete}
        />
      </div>
    </div>
  );

  const features = editorRef.current && editorRef.current.getFeatures();
  const selectedFeature =
    features && (features[selectedFeatureIndex] || features[features.length - 1]);
  const _onViewportChange = viewport => setViewPort({...viewport, transitionDuration: 0 })

  return (
      <div style={{ height: '100vh'}}>
      <button
        style={{height: '30px', width : '100px'}}
        onClick={() => buildLayers()}
        >
        draw features
        </button>
      <button
        style={{height: '30px', width : '100px'}}
        onClick={() => setValue()}
        >
        Set value
        </button>

        <button
          style={{height: '30px', width : '100px'}}
          onClick={() => getValue("jerry")}
          >
          getValue
          </button>

        <button
          style={{height: '30px', width : '100px'}}
          onClick={() => getSessionDetails("1-8235-aaaaa")}
          >
          API Get Button
          </button>

          <button
            style={{height: '30px', width : '100px'}}
            onClick={() => createSession("erics")}
            >
            API POST username Button
            </button>

            <button
              style={{height: '30px', width : '100px'}}
              onClick={() => getPolygons()}
              >
              get polygon
              </button>

        <h1 style={{textAlign: 'center', fontSize: '25px', fontWeight: 'bolder' }}>Use the search bar to find a location on the map</h1>
      <MapGL
        ref={mapRef}
        {...viewport}
        width="100%"
        height="100%"
        mapboxApiAccessToken={TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onViewportChange={_onViewportChange}
       >
       <Source id="maine" type="geojson" data={mainData3}>
        {circleLayers}
      </Source>
       <Geocoder
            mapRef={mapRef}
            onResult={handleOnResult}
            onViewportChange={handleGeocoderViewportChange}
            mapboxApiAccessToken={TOKEN}
            position='top-left'
          />
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
          {drawTools}
        </MapGL>
        <ControlPanel polygon={selectedFeature} />

      </div>
     )
    }

    export default App;
