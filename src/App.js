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
var CryptoJS = require("crypto-js");

const TOKEN='pk.eyJ1IjoiZXNvbGJlcmc3NyIsImEiOiJja3l1ZmpqYWgwYzAxMnRxa3MxeHlvanVpIn0.co7_t1mXkXPRE8BOnOHJXQ'

const geolocateStyle = {
  float: 'left',
  margin: '50px',
  padding: '10px'
};

// const mainStyle = {
//   id: 'circleLayers',
//   type: 'fill',
//   source: 'circleLayers', // reference the data source
//   paint: {
//         'fill-color': '#0080ff', // blue color fill
//         'fill-opacity': 0.5
//         }
//   }
  const searchedAreaStyle = {
    id: 'searchedAreaLayers',
    type: 'fill',
    source: 'searchedAreas', // reference the data source
    paint: {
          'fill-color': '#0080ff', // blue color fill
          'fill-opacity': 0.5
          }
    }

    const searchedCoordinateStyle = {
      id: 'searchedCoordinatesLayers',
      type: 'fill',
      source: 'searchedCoordinatesFeatures', // reference the data source
      paint: {
            'fill-color': '#ff0000', // red color fill
            'fill-opacity': 1
            }
      }

    const coordinateStyle = {
      id: 'coordinateLayers',
      type: 'line',
      source: 'coordinatesFeatures', // reference the data source
      paint: {
          "line-color": "#000000",
          "line-width": 1,
            }
      }

    // const unsearchedStyle = {
    //   id: 'circleLayers',
    //   type: 'fill',
    //   source: 'circleLayers', // reference the data source
    //   paint: {
    //         'fill-color': '#0080ff', // blue color fill
    //         'fill-opacity': 0.5
    //         }
    //   }


const App = () => {

  const counter = useRef(0)
  const editorRef = useRef(null);
  const mapRef = useRef()
  const searchedData = useRef(undefined)
  const unsearchedData = useRef(undefined)
  const nextCenter = useRef(undefined)
  const radius = useRef(undefined)
  const circleCoordinates = useRef(undefined)

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
  // const [circleLayers, setCircleLayers] = useState([<Layer key={"-1"} {...unsearchedStyle} />])
  const [searchedAreas, setSearchedAreas] = useState(
    {
    'type': 'FeatureCollection',
    'features': []
    }
  )
  const [searchedCoordinatesFeatures, setSearchedCoordinatesFeatures] = useState(
    {
    'type': 'FeatureCollection',
    'features': []
    }
  )
  const [coordinatesFeatures, setCoordinatesFeatures] = useState(
    {
    'type': 'FeatureCollection',
    'features': []
    }
  )

  // const mainStyle = {
  //   id: 'circleLayers',
  //   type: 'fill',
  //   source: 'circleLayers', // reference the data source
  //   paint: {
  //         'fill-color': '#0080ff', // blue color fill
  //         'fill-opacity': 0.5
  //         }
  //   }

  //  --- helper functions --

  // function sessionExplorer() {
  //   fetch('/get/loadSearch?' + new URLSearchParams({
  //   searchID: '7',
  //   checksum: JSON.stringify
  //   }), {method: 'GET'}).then(res => res.json()).then(data => {
  //         console.log(data);
  //       })
  //     }

  // function checksum(obj) {
  //   var key = "checksum";
  //   var encrypted = CryptoJS.HmacSHA1(msg, key);
  //   return CryptoJS.enc.Base64.stringify(encrypted)
  // }

  function checksumDataBundler() {
    return {"searched": searchedData.current, "unsearched": unsearchedData.current}
  }
  
  function checksum(obj) {
    let data =  JSON.stringify(obj)
    var dataChecksum = CryptoJS.MD5(data);
    console.log(dataChecksum.toString())
    return dataChecksum.toString()
  }

  async function putPostData(method, url = '', data = {}) {
    const replacer = (key, value) => typeof value === 'undefined' ? null : value;

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
      body: JSON.stringify(data, replacer) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  function incCounter() {
    counter.current = counter.current + 1
    return counter.current.toString()
  }

  // --- region search ---
  function buildCircle(center, radius) {
    var options = {
      steps: 20,
      units: 'kilometers',
      options: {}
    };
    var radius = radius;
    console.log("buildCircle radius")
    console.log(center)
    console.log(radius)
    var polygon = turf.circle(center, radius, options);
    console.log("turf circle built")
    return polygon
  }

  function buildCoord(center) {
    var options = {
      steps: 20,
      units: 'kilometers',
      options: {}
    };
    var radius = .1;
    var polygon = turf.circle(center, radius, options);
    return polygon
  }

  // function buildCoord(center) {
  //   return {
  //     'type': 'Feature',
  //     'geometry': {
  //       'type': 'Point',
  //       'coordinates': center
  //       }
  //   }
  // }

  function buildCircleGeoJSON(center, radius) {
    let nextCircle = buildCircle(center, radius)
    circleCoordinates.current = nextCircle.geometry.coordinates[0]
    return {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': nextCircle.geometry.coordinates
        }
    }
  }

  function setValue() {
    putPostData('POST', `/setUserSearch`, {"searchRegions": getPolygons(), "searchID": undefined}).then(data => {
      console.log(data)
      searchedData.current = data["searchedCoords"]
      unsearchedData.current = data["unsearchedCoords"]
      nextCenter.current = data["furthestNearest"]
      // setCoordinatesFeatures to include the geojson for each unsearched coordinate

    })
    console.log(searchedData)
    console.log(unsearchedData)
    console.log(nextCenter)
  }

  function printState() {
    console.log("searchedData")
    console.log(searchedData.current)
    console.log("unsearchedData")
    console.log(unsearchedData.current)
    console.log("nextCenter")
    console.log(nextCenter)
    console.log("radius")
    console.log(radius)
  }

  function getNextSearchCoord() {
    console.log("--------calling google API----------")
    // radius.current = dummyGoogleCall()
    console.log("sending")
    console.log(searchedData.current)
    console.log(unsearchedData.current)
    console.log(nextCenter.current)
    console.log(radius.current)
    console.log(circleCoordinates.current)
    putPostData('POST', `/getNextSearch`,
    {
      "searchedData": searchedData.current,
      "unsearchedData": unsearchedData.current,
      "lastCenter": nextCenter.current,
      "lastRadius": radius.current,
      "circleCoordinates": circleCoordinates.current,
      "searchID": 17
    }).then(data => {
        console.log("------- received --------")
        console.log(data)
        console.log("searchedData")
        console.log(data["searched"].length)
        console.log("unsearchedData")
        console.log(data["unsearched"].length)
        console.log("nextCenter")
        console.log(data["center"])
        console.log("newlySearchedCoordinates")
        console.log(data["newlySearchedCoordinates"])
        console.log(" ")
        nextCenter.current = data["center"]
        searchedData.current = data["searched"]
        unsearchedData.current = data["unsearched"]
        console.log(nextCenter)

        let prevSearchedCoords = [...searchedCoordinatesFeatures.features]
        let newSearchedCoordinates = []

        data["newlySearchedCoordinates"].forEach((coord, i) => {
          newSearchedCoordinates.push(buildCoordJSON(coord))
        })

        newSearchedCoordinates = newSearchedCoordinates.concat(prevSearchedCoords)
        setSearchedCoordinatesFeatures((prevValue) => ({ ...prevValue, features: newSearchedCoordinates }));

      })
    }



  function dummyGoogleCall(center) {
    radius.current = Math.random() * (3 - .5) + .5;
  }

  // function buildLayers() {
  //   let circles = []
  //   for (let feature in searchedCoordinatesFeatures.features) {
  //     circles.push(<Layer key={incCounter()} {...unsearchedStyle} />)
  //   }
  //   setCircleLayers((prevValue) => [...prevValue, ...circles])
  //   console.log(circleLayers)
  // }

  // function addLayer() {
  //   let layer = <Layer key={incCounter()} {...unsearchedStyle} />
  //   setCircleLayers((prevValue) => [...prevValue, layer])
  // }

  // add a data polygon json object for each coordinate in list of coordinates passed.
  function addCoordinates(data, target, setTarget) {
    let features = [...target.features]
    let coordFeatures = []
    data.forEach((coord, i) => {
      coordFeatures.push(buildCoordJSON(coord))
    })
    features = features.concat(coordFeatures)
    setTarget((prevValue) => ({ ...prevValue, features: features }));
  }

  function buildCoordJSON(center) {
    return {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': buildCoord(center).geometry.coordinates
        }
    }
  }


  function addCircle() {
    console.log("after api call")
    console.log(searchedAreas)
    console.log("radius.current")
    console.log(radius.current)
    let circleJson = buildCircleGeoJSON(nextCenter.current, radius.current)
    console.log("after buildCircleGeoJSON")
    console.log(searchedAreas)
    console.log("after setCircleLayers")
    console.log(searchedAreas)
    console.log([...searchedAreas.features])
    let newFeatures = [...searchedAreas.features]
    newFeatures.push(circleJson)
    console.log("newFeatures")
    console.log(newFeatures)
    setSearchedAreas((prevValue) => ({ ...prevValue, features: newFeatures }));
    console.log("after state change")
    console.log(searchedAreas)
    // setCircleLayers((prevValue) => [...prevValue, <Layer key={incCounter()} {...mainStyle} />])

  }


  function getPolygons() {
    let data = editorRef.current.getFeatures()
    console.log(data)
    let result = data.map(currentElement => currentElement.geometry.coordinates[0]);
    console.log(result)
    return result
  }

  async function search() {
    dummyGoogleCall()
    addCircle()
    getNextSearchCoord()
  }


  // --- Map ---

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

  const handleGeocoderViewportChange = viewport => {
    const geocoderDefaultOverrides = { transitionDuration: 1000 };
    console.log("Updating")

    return setViewPort({
      ...viewport,
      ...geocoderDefaultOverrides
    });
  }

  const features = editorRef.current && editorRef.current.getFeatures();
  const selectedFeature =
    features && (features[selectedFeatureIndex] || features[features.length - 1]);
  const _onViewportChange = viewport => setViewPort({...viewport, transitionDuration: 0 })


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

  return (
      <div style={{ height: '100vh'}}>
      <button
        style={{height: '30px', width : '100px'}}
        onClick={() => search()}
        >
        search
        </button>
      <button
        style={{height: '30px', width : '100px'}}
        onClick={() => addCircle()}
        >
        addCircle
        </button>
      <button
        style={{height: '30px', width : '100px'}}
        onClick={() => setValue()}
        >
        Set value
        </button>

        <button
          style={{height: '30px', width : '100px'}}
          onClick={() => getNextSearchCoord()}
          >
          getNextSearchCoord
          </button>

        <button
          style={{height: '30px', width : '100px'}}
          onClick={() => printState()}
          >
          print state
          </button>

          <button
            style={{height: '30px', width : '100px'}}
            onClick={() => {dummyGoogleCall(); console.log(radius.current)}}
            >
            dummy google call
            </button>

            <button
              style={{height: '30px', width : '100px'}}
              onClick={() => {addCoordinates(unsearchedData.current, coordinatesFeatures, setCoordinatesFeatures)}}
              >
              build coordinates
              </button>

            <button
              style={{height: '30px', width : '100px'}}
              onClick={() => checksum(checksumDataBundler())}
              >
              checksum
              </button>

            <button
              style={{height: '30px', width : '100px'}}
              onClick={() => {addCoordinates(circleCoordinates.current)}}
              >
              build next searhced coords
              </button>

          <button
              style={{height: '30px', width : '100px'}}
              onClick={() => {addCoordinates(searchedData.current, searchedCoordinatesFeatures, setSearchedCoordinatesFeatures)}}
            >
            build searhced coordinates
          </button>

          <button
            style={{height: '30px', width : '100px'}}
            onClick={() => console.log(nextCenter)}
            >
            next Center
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
      <Source id="coordinateLayer" type="geojson" data={coordinatesFeatures}>
        <Layer key={"1"} {...coordinateStyle} />
      </Source>

      <Source id="searchedAreaLayer" type="geojson" data={searchedAreas}>
        <Layer key={"2"} {...searchedAreaStyle} />
      </Source>

      <Source id="searchedCoordinateLayer" type="geojson" data={searchedCoordinatesFeatures}>
        <Layer key={"3"} {...searchedCoordinateStyle} />
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
