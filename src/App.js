import React, { useEffect, useRef, useState, useCallback } from 'react'
import MapGL, {GeolocateControl, Source, Layer } from 'react-map-gl'
import DeckGL, { GeoJsonLayer } from "deck.gl";
import Geocoder from "react-map-gl-geocoder";
import {Editor, DrawPolygonMode, EditingMode} from 'react-map-gl-draw';
import ControlPanel from './control-panel';
import {getFeatureStyle, getEditHandleStyle} from './style';
import * as turf from '@turf/turf'
import CurrencyInput from 'react-currency-input-field';
import FilePicker from './components/FilePicker.js'
import GoogleApiKeyLoader from './components/GoogleApiKeyLoader.js'
import SpinnerButton from './components/SpinnerButton.js'
import axios from 'axios'
import 'mapbox-gl/dist/mapbox-gl.css'
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css"
import {updateGoogleApi} from "./helperFunctions/google_JS_API_Helpers"
import {triggerAlertFor} from "./helperFunctions/arg_Checker"
import {axiosPutPostData} from "./helperFunctions/axios_Helpers"
import {buildSearch, nextSearch} from "./helperFunctions/server_API_Helpers"
const CryptoJS = require("crypto-js");
const placeTypes = require('./data/placeTypes.json');

const TOKEN='pk.eyJ1IjoiZXNvbGJlcmc3NyIsImEiOiJja3l1ZmpqYWgwYzAxMnRxa3MxeHlvanVpIn0.co7_t1mXkXPRE8BOnOHJXQ'

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


const App = () => {
  let service = useRef(undefined);
  const [apiKey, setApiKey] = useState('IzaSyBhJRgpD2FTMa8_q68645LQRb2qNVD6wlE')


  window.gm_authFailure = function(error) {
   alert('Google Maps API failed to load. Please check that your API key is correct and that the key is authorized for Google Maps JavaScript API');
   updateGoogleApi(apiKey)
  }

  useEffect(() => {
    window.addEventListener('beforeunload', saveBeforeLeaving)
    return () => {
      window.removeEventListener('beforeunload', saveBeforeLeaving)
    }
  }, [])

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  }

  const saveBeforeLeaving = e => {
    e.preventDefault()
    e.returnValue = ''
  }

  const featureSaver = useRef(undefined)
  const googleScript = useRef(undefined)
  const googleData = useRef([]);
  const dataFile = useRef(undefined)
  const searchID = useRef(undefined);

  const editorRef = useRef(undefined);
  const containerRef = useRef(undefined);
  const mapRef = useRef();
  const searchedData = useRef(undefined);
  const unsearchedData = useRef(undefined);
  const nextCenter = useRef(undefined);
  const radius = useRef(undefined);
  const circleCoordinates = useRef(undefined);


  const [viewport, setViewPort] = useState({
    width: "100%",
    height: 900,
    latitude: 0,
    longitude: 0,
    zoom: 1,
    transitionDuration: 100
  })

  const [searchType, setSearchType] = useState("Select")
  const [userSearchKey, setUserSearchKey] = useState("");
  const [fileNameText, setFileNameText] = useState("");
  const [searchResolution, setSearchResolution] = useState(0.5)

  const [searchRunning, setSearchRunning] = useState(false)
  const [callType, setCallType] = useState('')
  const prevCallType = usePrevious(callType);

  const [newSearch, setNewSearch] = useState(true)
  const [bulkSearchCount, setBulkSearchCount] = useState(false)
  const [searchResultLayer, setSearchResultLayer ] = useState(undefined)
  const [budget, setBudget] = useState(0)
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [mode, setMode] = useState(undefined);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(undefined);
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

  useEffect(() => {
    const validCalls = {
      'initializeSearch': initializeSearch,
      'singleSearch': singleSearch
    }
    if (Object.keys(validCalls).includes(callType) && !searchRunning) {
      validCalls[callType]().then(() => {
        setCallType('')
        setSearchRunning(false)
      }).catch(() => {
        setCallType('')
        setSearchRunning(false)
      })
    }
    console.log("aborted")
  }, [callType])


  function checksumDataBundler() {
    return {"searched": searchedData.current, "unsearched": unsearchedData.current}
  }

  function checksum(obj) {
    let data =  JSON.stringify(obj)
    var dataChecksum = CryptoJS.MD5(data);
    console.log(dataChecksum.toString())
    return dataChecksum.toString()
  }

  function buildCircle(center, radius) {
    var options = {
      steps: 20,
      units: 'miles',
      options: {}
    };
    var radius = radius;
    var polygon = turf.circle(center, radius, options);
    circleCoordinates.current = polygon.geometry.coordinates[0]
    return polygon
  }

  function buildCoord(center) {
    var options = {
      steps: 20,
      units: 'miles',
      options: {}
    };
    var radius = .01;
    var polygon = turf.circle(center, radius, options);
    return polygon
  }


  async function singleSearch() {
    // same
    let alertPresent = triggerAlertFor(
                          [
                            ['googleInit', []],
                            ['polygons', [getPolygons()]],
                            ['resolution', [searchResolution]],
                            ['searchType', [searchType]],
                            ['searchComplete', [unsearchedData.current.length]] // different
                          ]
                        )
    if (alertPresent) {
      return
    }

    try {
        // different
        let data = await nextSearch(circleCoordinates.current, searchID.current, checksum(checksumDataBundler()), searchType)
        // same
        setBudgetUsed((prev) => (parseFloat(prev) + 0.032).toFixed(4))
        addCoordinates(data["searchedData"], searchedCoordinatesFeatures, setSearchedCoordinatesFeatures)
        if (data["nextCenter"] && data["radius"]) {
          addCircle(data["nextCenter"], data["radius"])
        }
        searchedData.current = data["searchedData"]
        unsearchedData.current = data["unsearchedData"]
        nextCenter.current = data["nextCenter"]
        googleData.current = [...googleData.current, ...data["googleData"]]
      // same
    } catch(error) {
      console.log("--- error ---")
      if (error == 'ZERO_RESULTS') {
        console.log('string match')
      }
      console.log(error)
    }
  }



  async function initializeSearch() {
    let polygons = getPolygons()

    console.log(searchType)
    let alertPresent = triggerAlertFor(
                          [
                            ['googleInit', []],
                            ['polygons', [getPolygons()]],
                            ['resolution', [searchResolution]],
                            ['searchType', [searchType]]
                          ]
                        )
    if (alertPresent) {
      return
    }

    try {
      // different
      let data = await buildSearch(polygons, searchResolution, searchType)
      // same
      setBudgetUsed((prev) => (parseFloat(prev) + 0.032).toFixed(4))
      addCoordinates(data["searchedData"], searchedCoordinatesFeatures, setSearchedCoordinatesFeatures)
      if (data["nextCenter"] && data["radius"]) {
        addCircle(data["nextCenter"], data["radius"])
      }
      searchedData.current = data["searchedData"]
      unsearchedData.current = data["unsearchedData"]
      nextCenter.current = data["nextCenter"]
      googleData.current = [...googleData.current, ...data["googleData"]]
      // different
      searchID.current = data["searchID"]
      addCoordinates(data["unsearchedData"], coordinatesFeatures, setCoordinatesFeatures)
      // same
    } catch(error) {
      console.log("--- error ---")
      if (error == 'ZERO_RESULTS') {
        console.log('string match')
      }
      console.log(error)
    }

  }

  function clearData() {
    let features = editorRef.current.getFeatures()
    editorRef.current.deleteFeatures([...Array(features.length).keys()])

    // ref reset
    googleData.current = []
    setSearchType(undefined)
    searchID.current = undefined
    searchedData.current = undefined
    unsearchedData.current = undefined
    circleCoordinates.current = undefined
    nextCenter.current = undefined
    radius.current = undefined
    circleCoordinates.current = undefined

    // state reset
    setSearchRunning(false)
    setSearchResultLayer(undefined);
    setSearchResolution(undefined);
    setSelectedFeatureIndex(undefined);
    setSearchedAreas(
      {
      'type': 'FeatureCollection',
      'features': []
      }
    )

    setSearchedCoordinatesFeatures(
      {
      'type': 'FeatureCollection',
      'features': []
      }
    )

    setCoordinatesFeatures(
      {
      'type': 'FeatureCollection',
      'features': []
      }
    )
  }


  function printState() {
    console.log("")
    console.log("")
    console.log("")
    console.log(Object.getOwnPropertyNames(CurrencyInput))
    console.log("editorRef.current")
    console.log(editorRef.current.getFeatures())
    // console.log("after add")
    // console.log(editorRef.current.getFeatures())
    console.log("googleData")
    console.log(googleData.current)
    // console.log("editorRef.current")
    // console.log(editorRef.current)
    // console.log(editorRef.current.getFeatures())
    console.log("searchedData")
    console.log(searchedData.current)
    console.log("unsearchedData")
    console.log(unsearchedData.current)
    console.log("nextCenter")
    console.log(nextCenter)
    console.log("radius")
    console.log(radius)
    console.log("circleCoordinates")
    console.log(circleCoordinates)
    console.log("searchID")
    console.log(searchID.current)
    console.log("search type")
    console.log(searchType)
    console.log("resolution")
    console.log(searchResolution)
    console.log("searchedAreas")
    console.log(searchedAreas)

    console.log("searchResultLayer")
    console.log(searchResultLayer)
    console.log("searchedCoordinatesFeatures")
    console.log(searchedCoordinatesFeatures)
    console.log("coordinatesFeatures")
    console.log(coordinatesFeatures)
    console.log("apiKey")
    console.log(apiKey)
  }


  function dummyGoogleCall(center) {
    return new Promise((resolve) => {
      radius.current = Math.random() * (3 - .5) + .5;
      resolve("ok")
    })
  }

  function addCoordinates(data, target, setTarget) {
    let features = [...target.features]
    let coordFeatures = []
    data.forEach((coord, i) => {
      coordFeatures.push(buildCoord(coord))
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


  function addCircle(center, radius) {
    let circleJson = buildCircle(center, radius)
    let newFeatures = [...searchedAreas.features]
    newFeatures.push(circleJson)
    setSearchedAreas((prevValue) => ({ ...prevValue, features: newFeatures }));

  }

  function getPolygons() {
    let data = editorRef.current.getFeatures()
    let result = data.map(currentElement => currentElement.geometry.coordinates[0]);
    return result
  }


  async function syncBackend() {
    await axiosPutPostData('POST', `/loadSearch`,
      {
        "searched": searchedData.current,
        "unsearched": unsearchedData.current,
        "searchID": searchID.current,
      })
      }

  function loadFile(value) {
    let fileReader;

    const handleFileRead = (e) => {
      const content = fileReader.result;
      dataFile.current = content
    }

    const handleFileChosen = (file) => {
      setFileNameText(file["name"])
      console.log(file["name"])
      fileReader = new FileReader();
      fileReader.onloadend = handleFileRead;
      if (file) {
        fileReader.readAsText(file);
      }
    }
    handleFileChosen(value.target.files[0])
  }

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
    setSearchResultLayer( new GeoJsonLayer({
        id: "search-result",
        data: event.result.geometry,
        getFillColor: [255, 0, 0, 128],
        getRadius: 1000,
        pointRadiusMinPixels: 10,
        pointRadiusMaxPixels: 10
      })
    )
  }

  function handleBudgetChange(value) {
    if (value < -1) {
        setBudget(-1)
      } else {
        setBudget(value)
      }
    }

  const handleGeocoderViewportChange = viewport => {
  const geocoderDefaultOverrides = { transitionDuration: 1000 };

    return setViewPort({
      ...viewport,
      ...geocoderDefaultOverrides
    });
  }

  const features = editorRef.current && editorRef.current.getFeatures();
  const selectedFeature = features && (features[selectedFeatureIndex] || features[features.length - 1]);
  const _onViewportChange = viewport => setViewPort({...viewport, transitionDuration: 0 })

  const downloadFile = ({ data, fileName, fileType }) => {
    const blob = new Blob([data], { type: fileType })
    const a = document.createElement('a')
    a.download = fileName
    a.href = window.URL.createObjectURL(blob)
    const clickEvt = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    })
    a.dispatchEvent(clickEvt)
    a.remove()
  }

  function buildFromFile() {
    try {
      let data = JSON.parse(dataFile.current)
      console.log(data)
      googleData.current = data["googleData"]
      console.log("googleData")
      setSearchType(data["searchType"])
      console.log("searchType")
      searchID.current = data["searchID"]
      console.log("searchID")
      // setSearchResolution.current = data["resolution"]
      // console.log("resolution")
      searchedData.current = data["searchedData"]
      console.log("searchedData")
      unsearchedData.current = data["unsearchedData"]
      console.log("unsearchedData")
      nextCenter.current = data["nextCenter"]
      console.log("nextCenter")
      console.log(data["nextCenter"])
      setUserSearchKey(data["userSearchKey"])
      console.log("userSearchKey")

      setBudgetUsed(data["budgetUsed"])
      console.log("budgetUsed")
      setBudget(data["budget"])
      console.log("budget")
      editorRef.current.addFeatures(data["searchBorders"])
      addCoordinates(unsearchedData.current, coordinatesFeatures, setCoordinatesFeatures)
      addCoordinates(searchedData.current, searchedCoordinatesFeatures, setSearchedCoordinatesFeatures)
      setSearchedAreas(data["searchedAreas"])
      setSearchResolution(data["resolution"])

    } catch(error){
      console.log(error)
      }
    }


  function renderTypeOptions() {
    return placeTypes.map(type => <option key={type} value={type}>{type}</option>)
  }

  function renderSearchResolution() {
    if (newSearch) {
      return (
        <CurrencyInput
          id="input-example"
          name="input-name"
          placeholder="Search Resolution"
          defaultValue={searchResolution}
          value={searchResolution}
          decimalsLimit={2}
          onKeyDown = {(evt) => ['e', '-'].includes(evt.key) && evt.preventDefault() }
          onValueChange={(value) => setSearchResolution(value)}
          style={{backgroundColor: resolutionInputColor(), paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', height: '15px'}}
          />
      )
    } else {

      return (
        <input
          type="text"
          disabled={newSearch ? false : true}
          value={searchResolution ? searchResolution : 'Loaded from File'}
          style={{ padding: '5px', margin: '5px', textAlign: 'center'}}
          placeholder="Prior Data File"
          />
      )
    }
  }

  function resolutionInputColor() {
    if (!newSearch) {
      return '#cccccc'
    } else {
      if (searchResolution < 0.1) {
        return 'red'
      } else {
        return undefined
      }
    }
  }

  function handleSelectChange(event) {
    setSearchType(event.target.value)
  }

  function onChangeBulkQtyInput(e) {
    setBulkSearchCount(e.target.value)
  }

  function onChangeAPIkeyInput(e) {
    setApiKey(e.target.value)
  }

  function onChangeUserKey(e) {
    setUserSearchKey(e.target.value)
  }

  function commonSettings() {
    return (
        <div style={{flex: '1', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <div style={{paddingRight: '20px', justifyContent: 'flex-end', display: 'flex', flexDirection: 'column', width: '250px'}}>
            <button
              onClick={() => {
                if (!newSearch) {
                  selectNewSearch(true)
                }}}
              style={{padding: '5px', margin: '5px', backgroundColor: newSearch ? '#cccccc' : undefined }}
              >
              New Search
              </button>

            <button
              onClick={() => {
                if (newSearch) {
                  selectNewSearch(false)
                }}}
              style={{padding: '5px', margin: '5px', backgroundColor: newSearch ? undefined : '#cccccc'}}
              >
              Load Prior Search
              </button>

            <button
              onClick={(e) => exportToJson(e)}
              style={{padding: '5px', margin: '5px'}}
              >
              Download Data
              </button>
          </div>

          <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', flex: '1' }}>
            Choose an Entity Type to Search
            <div style={{ paddingTop: '10px', fontSize: '12px', display: 'flex', textAlign: 'center', justifyContent: 'center'}}>
              These types are dictated by Google, and are limited
              to one type per search.
            </div>
            <div style={{ flexGrow: '1'}}/>
            <select disabled={newSearch ? false : true} value={searchType} onChange={handleSelectChange} id="typeSelect" style={{paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', textAlign: 'center'}}>
              {renderTypeOptions()}
            </select>
          </div>

          <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', flex: '1'}}>
            Enter Google API Key
            <div style={{ paddingTop: '10px', fontSize: '12px', display: 'flex', textAlign: 'center', justifyContent: 'center'}}>
              The Key will not be saved and is only used to call the google places API directly.
            </div>
            <div style={{ flexGrow: '1'}}/>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'row', alignItems: 'flex-end'}}>
              <input
                value={apiKey}
                onChange={(e) => onChangeAPIkeyInput(e)}
                style={{ marginLeft: '5px', height: '15px', paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', textAlign: 'center'}}
                placeholder="Google API Key"
                />

                <SpinnerButton
                  func={updateGoogleApi}
                  funcArgs={[apiKey]}
                  height='15px'
                  width='47px'
                  >
                  Set Key
                  </SpinnerButton>
            </div>
          </div>

          <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', flex: '1'}}>
            Set Budget
            <div style={{ paddingTop: '10px', fontSize: '12px', display: 'flex', textAlign: 'center', justifyContent: 'center'}}>
              Enter -1 for unlimited budget: use this option with care.
            </div>
              <CurrencyInput
                prefix="$"
                id="input-example"
                name="input-name"
                placeholder="Enter a max budget"
                defaultValue={budget}
                value={budget}
                decimalsLimit={2}
                onValueChange={(value) => handleBudgetChange(value)}
                style={{paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', height: '15px'}}
                />
            <div style={{ flexGrow: '1'}}/>
              Budget Used
              <CurrencyInput
                prefix="$"
                id="input-example"
                name="input-name"
                placeholder="Enter a max budget"
                value={budgetUsed}
                disabled={true}
                decimalsLimit={4}
                style={{paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', height: '15px'}}
                />
          </div>

          <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', flex: '1'}}>
            Enter User Key
            <div style={{ fontSize: '12px', paddingTop: '10px'}}>
              This key is anything you want, and is used to organize your search data.
            </div>
            <div style={{ flexGrow: '1'}}/>
            <input
              value={userSearchKey}
              onChange={(e) => onChangeUserKey(e)}
              style={{ paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', textAlign: 'center'}}
              placeholder="Custom User Key"
              />
          </div>

          <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', flex: '1'}}>
            Enter Search Resolution
            <div style={{ fontSize: '12px', paddingTop: '10px'}}>
              This is the spacing between search coordinates within the search region.
              The minimum resolution is 0.1 miles.
            </div>
            <div style={{ flexGrow: '1'}}/>
            {renderSearchResolution()}
          </div>

        </div>
      )
    }

  function loadSearchTools() {
    if (!newSearch) {
      return (
        <div style={{flex: '1', flexDirection: 'row'}}>

          <div
            style={
              {padding: '10px',
              display: 'flex',
              backgroundColor: 'green',
              flexDirection: 'row',
              justifyContent: 'flex-star',
              alignItems: 'flex-end'
              }}
            >

            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <FilePicker
                onChange={e => loadFile(e)}
                filename={fileNameText}
                />
            </div>

            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <button
                onClick={() => buildFromFile()}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Build Search From File
                </button>

              <button
                onClick={() => setCallType('singleSearch')}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Single Search
                </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <button
                onClick={() => console.log(bulkSearchCount)}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Bulk Search
                </button>
              <input
                type="number"
                value={bulkSearchCount}
                min="0"
                onKeyDown={ (evt) => ['e', '.', '-'].includes(evt.key) && evt.preventDefault() }
                onChange={(e) => onChangeBulkQtyInput(e)} style={{ padding: '5px', margin: '5px', textAlign: 'center'}}
                placeholder="Bulk Search Qty"
                />
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  function newSearchTools() {
    if (newSearch) {
      return (
        <div style={{flex: '1', flexDirection: 'row'}}>
          <div
            style={
              {padding: '10px',
              display: 'flex',
              backgroundColor: 'green',
              flexDirection: 'row',
              justifyContent: 'flex-star',
              alignItems: 'flex-end'
              }}
            >

            <div style={{display: 'flex', flexDirection: 'column'}}>
              <button
                onClick={() => setMode(new DrawPolygonMode())}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Select Search Area
                </button>

                <button
                  title="Delete"
                  onClick={onDelete}
                  style={{padding: '5px', margin: '5px', width: '150px'}}
                  >
                  Delete Search Area
                  </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <button
                onClick={() => initializeSearch()}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Build Search
                </button>

              <button
                onClick={() => setCallType('singleSearch')}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Single Search
                </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column'}}>
              <button
                onClick={() => console.log(bulkSearchCount)}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Bulk Search
                </button>

                <input
                  type="number"
                  value={bulkSearchCount}
                  min="0"
                  onKeyDown={ (evt) => ['e', '.', '-'].includes(evt.key) && evt.preventDefault() }
                  onChange={(e) => onChangeBulkQtyInput(e)}
                  style={{ padding: '5px', margin: '5px', textAlign: 'center'}}
                  placeholder="Bulk Search Qty"
                  />
            </div>
          </div>
        </div>
      )
    }
    return null
  }


  function existingDataWarning(callback) {
    if (editorRef.current.getFeatures().length > 0 || googleData.current.length == 0 || searchedData.current || unsearchedData.current) {
      let selection = window.confirm(
        "WARNING: Data is present from an in progress search session." +
        " If you continue, this data will be lost.  Please use the 'Download Data'"+
        " option if you wish to keep this information."
      )
      if (selection) {
        clearData()
        return true
      } else {
        return false
      }
    }
    return true
  }


  function selectNewSearch(val) {
    console.log(searchResolution)
    if (existingDataWarning())
    setNewSearch((prev) => val)
    }

  const exportToJson = e => {
    e.preventDefault()
    let datetime = new Date().toLocaleString();

    let searchDataObject = {
          "searchedData": searchedData.current,
          "unsearchedData": unsearchedData.current,
          "searchedAreas": searchedAreas,
          "googleData": googleData.current,
          "searchType": searchType,
          "budget": budget,
          "budgetUsed": budgetUsed,
          "resolution": searchResolution,
          "userSearchKey": userSearchKey,
          "nextCenter": nextCenter.current,
          "searchID": searchID.current,
          "searchBorders": features
        }

    let include = [
    'west',
    'compound_code',
    'viewport',
    'width',
    'types',
    'icon_background_color',
    'place_id',
    // 'isOpen',
    'east',
    'opening_hours',
    'name',
    'reference',
    'photos',
    'height',
    'south',
    'getUrl',
    'north',
    'rating',
    'lng',
    'icon',
    'html_attributions',
    'geometry',
    'location',
    'scope',
    'lat',
    'vicinity',
    'plus_code',
    'user_ratings_total',
    'global_code',
    'icon_mask_base_uri',
    'price_level',
    'business_status',
    'type',
    'features',
    'properties',
    'coordinates',
    ...Object.keys(searchDataObject)
    ]

    let d = JSON.stringify(searchDataObject, include)
    downloadFile({
      data: JSON.stringify(searchDataObject, include),
      fileName: `${searchType}_${userSearchKey}_${datetime}.json`,
      fileType: 'text/json',
    })
  }


  function renderToolTitle() {
    if (newSearch) {
      return 'New Search'
      }
    return 'Existing Search'
  }


  return (
      <div style={{ height: '100vh', flex: '1'}}>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
          }}>
            <button
              style={{height: '30px', width : '100px'}}
              onClick={() => printState()}
              >
              print state
              </button>

            <button
              style={{height: '30px', width : '100px'}}
              onClick={() => syncBackend()}
              >
              sync backent
              </button>

            <button
              style={{height: '30px', width : '100px'}}
              onClick={() => {dummyGoogleCall(); console.log(radius.current)}}
              >
              dummy google call
              </button>

            <button
              style={{height: '30px', width : '100px'}}
              onClick={() => checksum(checksumDataBundler())}
              >
              checksum
              </button>

        </div>
        <div style={{ height: '50px'}}/>
          {commonSettings()}
        <div style={{padding: '10px', display: 'flex', justifyContent: 'center'}}>
          {renderToolTitle()}
        </div>
          {newSearchTools()}
          {loadSearchTools()}

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
            onResult={handleOnResult}
            onViewportChange={handleGeocoderViewportChange}
            mapboxApiAccessToken={TOKEN}
            position='top-left'
            />

          <Source id="coordinateLayer" type="geojson" data={coordinatesFeatures}>
            <Layer key={"1"} {...coordinateStyle} />
          </Source>

          <Source id="searchedAreaLayer" type="geojson" data={searchedAreas}>
            <Layer key={"2"} {...searchedAreaStyle} />
          </Source>

          <Source id="searchedCoordinateLayer" type="geojson" data={searchedCoordinatesFeatures}>
            <Layer key={"3"} {...searchedCoordinateStyle} />
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
      </div>
     )
    }

export default App;
