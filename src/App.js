import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setPolygons } from './features/map/mapSlice'
import { googleSearchManager } from './data/GoogleSearchManager'
import { BsFillQuestionCircleFill } from 'react-icons/bs';
import MapGL, {GeolocateControl, Source, Layer } from 'react-map-gl'
import DeckGL, { GeoJsonLayer } from "deck.gl";
import Geocoder from "react-map-gl-geocoder";
import {Editor, DrawPolygonMode, EditingMode} from 'react-map-gl-draw';
import {getFeatureStyle, getEditHandleStyle} from './style';
import * as turf from '@turf/turf'
import { ToggleSlider }  from "react-toggle-slider";
import CurrencyInput from 'react-currency-input-field';
import FilePicker from './components/FilePicker.js'
import SpinnerButton from './components/SpinnerButton.js'
import IconButton from './components/IconButton.js'
import axios from 'axios'
import 'mapbox-gl/dist/mapbox-gl.css'
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css"
// import {updateGoogleApi} from "./helperFunctions/google_JS_API_Helpers"
import {triggerAlertFor} from "./helperFunctions/arg_Checker"
import {axiosPutPostData} from "./helperFunctions/axios_Helpers"
import {buildSearch, nextSearch} from "./helperFunctions/server_API_Helpers"
import {initializeSearch as initializeSearchSlice} from './features/search/buildSearchSlice'
const CryptoJS = require("crypto-js");
const placeTypes = require('./data/placeTypes.json');
const infoMessages = require('./data/informationText.json');

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
  const [apiKey, setApiKey] = useState('')
  const [apiKeyStale, setApiKeyStale] = useState(false)
  const dispatch = useDispatch()
  const  mapData = useSelector((state) => state.buildSearch.data)
  // const googleSearchManager = new GoogleSearchManager()
  // console.log("running googleSearchManager")
  useEffect(() => {
    if (!apiKeyStale) {
      setApiKeyStale(true)
    }
  }, [apiKey])


  window.gm_authFailure = function(error) {
   let selection = window.confirm(
    'Google Maps API failed to load. Please check that your API key is correct' +
    ' and that the key is authorized for Google\'s "Maps JavaScript API" and "Places API".' +
    ' This can be done from the Google Cloud Console.' +
    '\n \n' +
    'Click "OK" to be taken to the instruction page for creating Google API keys and enabling the required APIs' +
    ' at the below URL:\n \n' +
    'https://developers.google.com/maps/documentation/javascript/get-api-key'
   )
   if (selection) {
     window.open('https://developers.google.com/maps/documentation/javascript/get-api-key', '_blank', 'noopener,noreferrer');
   } else {
     console.log("stay on page")
   }
   // updateGoogleApi(apiKey)
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
  const filePickerRef = useRef()
  const searchID = useRef(undefined);
  const searchComplete = useRef(false)

  const resolutionRef = useRef()
  const editorRef = useRef(undefined);
  const containerRef = useRef(undefined);
  const mapRef = useRef();
  const searchedData = useRef(undefined);
  const unsearchedData = useRef(undefined);
  const nextCenter = useRef(undefined);
  const searchCentroid = useRef(undefined);
  const nextRadius = useRef(undefined);
  const circleCoordinates = useRef(undefined);


  const [viewport, setViewPort] = useState({
    width: "100%",
    height: 900,
    latitude: 0,
    longitude: 0,
    zoom: 1,
    transitionDuration: 100
  })

  // signals
  const [searchType, setSearchType] = useState("Select")

  // flags
  const [searchBuilt, setSearchBuilt] = useState(false)
  const [testMode, setTestMode] = useState(true)
  const [searchRunning, setSearchRunning] = useState(false)
  const [newSearch, setNewSearch] = useState(true)
  const [mode, setMode] = useState(undefined);

  // data
  const [totalSearchedArea, setTotalSearchedArea] = useState(0);
  const [userSearchKey, setUserSearchKey] = useState("");
  const [fileNameText, setFileNameText] = useState("");
  const [searchResolution, setSearchResolution] = useState(0.5)
  const [callType, setCallType] = useState('')
  const prevCallType = usePrevious(callType);
  const [bulkSearchCount, setBulkSearchCount] = useState(false)
  const [searchResultLayer, setSearchResultLayer ] = useState(undefined)
  const [budget, setBudget] = useState(0)
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [efficiency, setEfficiency] = useState(0)
  const [projectedSavings, setProjectedSavings] = useState(0)
  const [projectedSearchCost, setProjectedSearchCost] = useState(0)

  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(undefined);
  const [searchedAreas, setSearchedAreas] = useState(
    {
    'type': 'FeatureCollection',
    'features': []
    }
  )

  useEffect(() => {
    if (editorRef.current && searchedAreas.features.length > 0) {
      calcSearchEfficiency()
    }
  }, [searchedAreas])


  function calcCoverage() {
    let coordinates =  searchedAreas.features.map(feature => feature.geometry.coordinates[0])

    let features = {
      "type": "Features",
      "coordinates": coordinates
    }
  }

  function setMergedPoly(coordinates) {
    let newPoly = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [coordinates]
            }
        }

    ]
    }
    setSearchedAreas(newPoly)
  }

  // function getPoly(geoJSON) {
  //   let coordinates =  searchedAreas.features.map(feature => feature.geometry.coordinates)
  //
  //   return geoJSON.type=='Polygon' ? turf.polygon(coordinates) : turf.multiPolygon(coordinates);
  // }
  //
  // let result = listaMappe.map(a => getPoly(JSON.parse(a.geoJSON)));
  //
  // var union = turf.union.apply(result);


  const [searchedCoordinatesFeatures, setSearchedCoordinatesFeatures] = useState(
    {
    'type': 'FeatureCollection',
    'features': []
    }
  )
  const [coordinatesFeatures, setCoordinatesFeatures, getCoordinatesFeatures] = useState(
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
        }).catch((error) => {
          console.log(error)
        }).finally(() => {
          setCallType('')
          setSearchRunning(false)
        })
    } else {
      console.log("aborted")
    }
  }, [callType])


  function checksumDataBundler() {
    return {"searched": searchedData.current, "unsearched": unsearchedData.current}
  }

  function checksum(obj) {
    let data =  JSON.stringify(obj)
    var dataChecksum = CryptoJS.MD5(data);
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
    var radius = .035;
    var polygon = turf.circle(center, radius, options);
    return polygon
  }

  async function bulkSearch() {

    let alertArgs = [

      ['searchInit', [unsearchedData]],
      ['polygons', [getPolygons()]],
      ['resolution', [searchResolution]],
      ['searchType', [searchType]],
      ['budgetExceeded', [budget, budgetUsed]],
      ['searchInit', [unsearchedData]],
      ['searchComplete', [unsearchedData]] // different
    ]

  if (!testMode) {
    alertArgs = [['googleInit', []], ...alertArgs]
  }

    if (!bulkSearchCount) {
      alert("Please specify the Qty of  searches to run in bulk.")
    } else {

      if (confirmBulkSearch(bulkSearchCount, bulkSearchCount * .032)) {
        for (let i=0; i < bulkSearchCount; i++) {

          if (triggerAlertFor(alertArgs)) {
            return
          } else {
            await singleSearch()
          }

        }
      }
      alert("Bulk Search complete.")
    }
  }

  async function singleSearch() {

    let alertArgs = [
      ['searchInit', [unsearchedData]],
      ['polygons', [getPolygons()]],
      ['resolution', [searchResolution]],
      ['searchType', [searchType]],
      ['budgetExceeded', [budget, budgetUsed]],
      ['searchComplete2', [searchComplete]]
    ]

  if (!testMode) {
    alertArgs = [['googleInit', []], ...alertArgs]
  }

    // same
    let alertPresent = triggerAlertFor(alertArgs)

    if (alertPresent) {
      console.log("single search aborted due to rule fail")
      return
    }

    try {
        // different
        let data = await nextSearch(nextCenter.current, searchID.current, checksum(checksumDataBundler()), searchType, testMode)
        // same
        setBudgetUsed((prev) => (parseFloat(prev) + 0.032).toFixed(4))
        updateCoordinates(data["unsearchedData"], coordinatesFeatures, setCoordinatesFeatures)
        // addCoordinates(data["searchedData"], searchedCoordinatesFeatures, setSearchedCoordinatesFeatures)
        nextRadius.current = data["radius"]

        if (data["unsearchedData"].length == 0) {
          searchComplete.current = true
        }

        if (data["nextCenter"]) {
          addCoordinates([data["nextCenter"]], searchedCoordinatesFeatures, setSearchedCoordinatesFeatures)
        }
        if (nextCenter.current) {
          addCircle(nextCenter.current, nextRadius.current)
        }
        setTotalSearchedArea((prev) => prev + (3.14 * (nextRadius.current**2)))
        searchedData.current = data["searchedData"]
        unsearchedData.current = data["unsearchedData"]
        nextCenter.current = data["nextCenter"]
        googleData.current = [...googleData.current, ...data["googleData"]]
        // calcSearchEfficiency()
      // same
    } catch(error) {
      if (error == 'ZERO_RESULTS') {
      }
      console.log(error)
      // if effor code 409, sync backend
      throw(error)
      if (error.response.status) {
        try {
          console.log("syncing")
          await syncBackend()
          singleSearch()
        } catch {
          console.log("failed to sync")
        }
      }
    }
  }



  async function initializeSearch() {
    let polygons = getPolygons()


    let alertArgs = [
      ['polygons', [getPolygons()]],
      ['resolution', [searchResolution]],
      ['searchType', [searchType]],
      ['budgetExceeded', [budget, budgetUsed]],
      ['searchComplete', [unsearchedData]]
    ]

  if (!testMode) {
    alertArgs = [['googleInit', []], ...alertArgs]
  }

    let alertPresent = triggerAlertFor(alertArgs)
    if (alertPresent) {
      return
    }

    try {
      // different
      let data = await buildSearch(polygons, searchResolution, searchType, testMode)
      // same
      // setBudgetUsed((prev) => (parseFloat(prev) + 0.032).toFixed(4))
      addCoordinates(data["searchedData"], searchedCoordinatesFeatures, setSearchedCoordinatesFeatures)
      addCoordinates([data["nextCenter"]], searchedCoordinatesFeatures, setSearchedCoordinatesFeatures)
      updateCoordinates(data["unsearchedData"], coordinatesFeatures, setCoordinatesFeatures)
      // setSearchedCoordinatesFeatures((prev) => ...prev, features: data["unsearchedData"])

      searchedData.current = data["searchedData"]
      unsearchedData.current = data["unsearchedData"]
      nextCenter.current = data["nextCenter"]
      searchCentroid.current = data["nextCenter"]

      // different
      searchID.current = data["searchID"]
      // addCoordinates(data["unsearchedData"], coordinatesFeatures, setCoordinatesFeatures)
      // same
    } catch(error) {
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
    nextRadius.current = undefined
    circleCoordinates.current = undefined
    searchComplete.current = false

    // state reset
    setTotalSearchedArea(0)
    setSearchBuilt(false)
    setSearchRunning(false)
    setSearchResultLayer(undefined);
    setSearchResolution('');
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


  function addCoordinates(data, target, setTarget) {
    if (data) {
      let features = [...target.features]
      let coordFeatures = []
      data.forEach((coord, i) => {
        coordFeatures.push(buildCoord(coord))
      })
      features = features.concat(coordFeatures)
      setTarget((prevValue) => ({ ...prevValue, features: features }));
    }
  }


  function updateCoordinates(data, target, setTarget) {

    let coordFeatures = []
    data.forEach((coord, i) => {
      coordFeatures.push(buildCoord(coord))
    })
    setTarget((prevValue) => ({ ...prevValue, features: coordFeatures }));
  }

  function removeCoordinates(data, target, setTarget) {
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
    setSearchedAreas((prevValue) => ({ ...prevValue, features: [...prevValue["features"], circleJson]}))
  }

  function getPolygons() {
    if (editorRef.current){
      let data = editorRef.current.getFeatures()
      let result = data.map(currentElement => currentElement.geometry.coordinates[0]);
      return result
    }
  }


  async function syncBackend() {
    await axiosPutPostData('PUT', `/api/loadSearch`,
      {
        "searched": searchedData.current,
        "unsearched": unsearchedData.current,
        "searchID": searchID.current,
      })
      }

  async function cleanPolygons() {
    let response = await axiosPutPostData('PUT', `/api/mergePolygons`,
      {
        "polygons": getPolygons(),
      })
      return response["data"]["efficiency"]
      }

  async function calcSearchEfficiency() {
    let coordinates =  searchedAreas.features.map(feature => feature.geometry.coordinates[0])

    let response = await axiosPutPostData('PUT', `/api/mergePolygons`,
      {
        "searchedAreas": coordinates,
        "searchRegions": getPolygons(),
        "budgetUsed": budgetUsed
      })
      // return response["data"]
      let data = response["data"]

      setEfficiency(data["efficiency"])
      setProjectedSavings(data["projectedSavings"])
      setProjectedSearchCost(data["projectedSearchCost"])
      return data
      }

  function loadFile(value) {
    let fileReader;

    const handleFileRead = (e) => {
      const content = fileReader.result;
      dataFile.current = content
    }

    const handleFileChosen = (file) => {
      setFileNameText(file["name"])
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


  function handleBudgetChange(value) {
    let cleanValue = isNaN(value) ? 0 : parseFloat(value)
    if (cleanValue < -1) {
        setBudget(-1)
      } else {
        setBudget(value)}
    }


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

  function handleResolutionChange(value) {
    setSearchResolution(value)
  }

  function buildFromFile() {

    let alertArgs = [
      ['fileLoaded', [dataFile]],
      ['fileError', [dataFile]]
    ]

    // same
    let alertPresent = triggerAlertFor(alertArgs)

    if (alertPresent) {
      return
    }

    try {
      let data = JSON.parse(dataFile.current)
      googleData.current = data["googleData"]
      setSearchType(data["searchType"])
      searchID.current = data["searchID"]
      searchCentroid.current = data["searchCentroid"]
      circleCoordinates.current = data["circleCoordinates"]
      searchedData.current = data["searchedData"]
      unsearchedData.current = data["unsearchedData"]
      nextCenter.current = data["nextCenter"]
      setUserSearchKey(data["userSearchKey"])

      setBudgetUsed(data["budgetUsed"])
      setBudget(data["budget"])
      editorRef.current.addFeatures(data["searchBorders"])
      addCoordinates(unsearchedData.current, coordinatesFeatures, setCoordinatesFeatures)
      // addCoordinates(searchedData.current, searchedCoordinatesFeatures, setSearchedCoordinatesFeatures)
      setSearchedAreas(data["searchedAreas"])
      setSearchResolution(data["resolution"])
      findOrigin(...data["searchCentroid"])
      setSearchBuilt(true)

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
        return '#fde0e0'
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

  function interfaceOptions() {
    return (
      <div style={{padding: '20px'}}>
        <button
          onClick={() => {
            if (!newSearch) {
              selectNewSearch(true)
            }}}
          style={{width: '150px', padding: '5px', margin: '5px', backgroundColor: newSearch ? '#cccccc' : undefined }}
          >
          New Search
          </button>

        <button
          onClick={() => {
            if (newSearch) {
              selectNewSearch(false)
            }}}
          style={{width: '150px', padding: '5px', margin: '5px', backgroundColor: newSearch ? undefined : '#cccccc'}}
          >
          Load Prior Search
          </button>

        <button
          onClick={(e) => exportToJson(e)}
          style={{width: '150px', padding: '5px', margin: '5px'}}
          >
          Download Data
          </button>

        <button
          onClick={(e) => existingDataWarning(e)}
          style={{width: '150px', padding: '5px', margin: '5px'}}
          >
          Clear Search
          </button>

          <button
            onClick={(e) => dispatch(setPolygons(getPolygons()))}
            style={{width: '150px', padding: '5px', margin: '5px'}}
            >
            getPolygons
            </button>

            <button
              onClick={(e) => dispatch(initializeSearchSlice())}
              style={{width: '150px', padding: '5px', margin: '5px'}}
              >
              initialize search
              </button>

              <button
                onClick={() => {
                  // const service = new window.google.maps.places.PlacesService(document.createElement('div'));
                  console.log(googleSearchManager.service)
                  console.log(window)
                }
              }
                style={{width: '150px', padding: '5px', margin: '5px'}}
                >
                create service
                </button>

              <button
                onClick={() => {
                  console.log("updateGoogleApi")
                  googleSearchManager.updateGoogleApi('AIzaSyBhJRgpD2FTMa8_q68645LQRb2qNVD6wlE')
                  // .then(() => {
                  //   console.log("tag", googleSearchManager.tagScript)
                  //   console.log("service", googleSearchManager.service)
                  //   console.log("node", googleSearchManager.node)
                  // })

                  // googleSearchManager.apiKey = 'AIzaSyBhJRgpD2FTMa8_q68645LQRb2qNVD6wlE'
                  // const service = new window.google.maps.places.PlacesService(document.createElement('div'));
                }
              }
                style={{width: '150px', padding: '5px', margin: '5px'}}
                >
                load google service
                </button>

              <button
                onClick={() => {
                  googleSearchManager.removeGoogle()
                }
              }
                style={{width: '150px', padding: '5px', margin: '5px'}}
                >
                remove google
                </button>

              <button
                onClick={() => {
                  console.log(window)
                  console.log(googleSearchManager.service)
                }
              }
                style={{width: '150px', padding: '5px', margin: '5px'}}
                >
                window
                </button>
      </div>
    )
  }
  function commonSettings() {
    return (
        <div style={{flex: '1', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>


          <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', flex: '1'}}>
            <div style={{fontWeight: 'bold'}}>
            Enter Google API Key
            </div>
            <div style={{ paddingTop: '10px', fontSize: '12px', display: 'flex', textAlign: 'center', justifyContent: 'center'}}>
              The Key will not be saved and is only used to call the google places API directly.
            </div>

            <div style={{ flex: '1', display: 'flex', flexDirection: 'row', alignItems: 'flex-end'}}>
              <input
                value={apiKey}
                onChange={(e) => onChangeAPIkeyInput(e)}
                style={{ marginLeft: '5px', height: '15px', paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', textAlign: 'center'}}
                placeholder="Google API Key"
                disabled={testMode}
                />

                <SpinnerButton
                  func={googleSearchManager.updateGoogleApi}
                  funcArgs={[apiKey]}
                  height='15px'
                  width='47px'
                  onClick={() => setApiKeyStale(false)}
                  buttonStyle={{backgroundColor: apiKeyStale ? '#fde0e0' : 'none'}}
                  buttonKey={apiKeyStale}
                  disabled={testMode}
                  >
                  {apiKeyStale ? 'Set Key' : 'Key Set'}
                  </SpinnerButton>
            </div>
          </div>

          <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', flex: '1' }}>
            <div style={{fontWeight: 'bold'}}>
            Select Search Entity Type
            </div>
            <div style={{ paddingTop: '10px', fontSize: '12px', display: 'flex', textAlign: 'center', justifyContent: 'center'}}>
              These types are dictated by Google, and are limited
              to one type per search.
            </div>
            <div style={{ flexGrow: '1'}}/>
            <select key={searchType} disabled={newSearch ? false : true} value={searchType} onChange={handleSelectChange} id="typeSelect" style={{paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', textAlign: 'center'}}>
              {renderTypeOptions()}
            </select>
          </div>



          <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', flex: '1'}}>
            <div style={{fontWeight: 'bold'}}>
            Set Budget
            </div>
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
                style={{paddingTop: '5px', paddingBottom: '5px', marginTop: '20px', marginBottom: '5px', height: '15px'}}
                />
            <div style={{fontWeight: 'bold', flexGrow: '1'}}/>
              <div style={{fontWeight: 'bold'}}>
              Budget Used
              </div>
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
            <div style={{fontWeight: 'bold'}}>
            Enter User Key
            </div>
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
            <div style={{fontWeight: 'bold'}}>
            Enter Search Resolution
            </div>
            <div style={{ fontSize: '12px', paddingTop: '10px'}}>
              This is the spacing between search coordinates within the search region.
              The minimum resolution is 0.1 miles.
            </div>
            <div style={{ flexGrow: '1'}}/>
            {renderSearchResolution()}
          </div>
          <div style={{paddingRight: '20px', justifyContent: 'flex-end', display: 'flex', flexDirection: 'column', width: '250px'}}>
                <div style={{paddingTop: '5px', display: 'flex', flex: '1', flexDirection: 'column', alignItems:'center'}}>
                  <div style={{fontWeight: 'bold'}}>
                    Test Without Google Key
                  </div>
                  <div style={{ padding: '5px', paddingTop: '5px', justifyContent: 'center', display: 'flex', flexDirection: 'row'}}>
                    <div style={{ paddingLeft: '10px', whiteSpace: 'wrap', minWidth: '125px', paddingTop: '5px', fontSize: '12px', display: 'flex', textAlign: 'center', justifyContent: 'center'}}>
                      This setting will replace Google API calls with a dummy call, and produce dummy data.
                    </div>
                    <div style={{paddingLeft: '10px', display: 'flex', alignItems: 'center'}}>
                    <ToggleSlider
                      onToggle={() => setTestMode((prev) => !prev)}
                      active={testMode}
                      />
                    </div>
                  </div>
              </div>
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
              flexDirection: 'row',
              justifyContent: 'flex-star',
              alignItems: 'flex-end'
              }}
            >

            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <FilePicker
                onChange={e => loadFile(e)}
                filename={fileNameText}
                disabled={searchBuilt}
                />
            </div>

            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <button
                onClick={() => buildFromFile()}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                disabled={searchBuilt}
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
                onClick={() => bulkSearch()}
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
              flexDirection: 'row',
              justifyContent: 'flex-star',
              alignItems: 'flex-end'
              }}
            >

            <div style={{display: 'flex', flexDirection: 'column'}}>
              <button
                onClick={() => setMode(new DrawPolygonMode())}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                disabled={searchBuilt}
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
                disabled={unsearchedData.current != undefined}
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
                onClick={() => bulkSearch()}
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


  function existingDataWarning() {

    if (editorRef.current.getFeatures().length > 0 || googleData.current.length != 0 || searchedData.current || unsearchedData.current) {
      let selection = window.confirm(
        "WARNING: Data is present from an in progress search session." +
        " If you continue, this data will be lost.  Please use the 'Download Data'"+
        " option if you wish to keep your current data."
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

  function confirmBulkSearch(searchQty, totalCost) {
      let selection = window.confirm(
        `WARNING: Please confirm you execute ${searchQty} calls to the Google Places Api.` +
        ` for a projected total cost of $${totalCost}.`
      )
      if (selection) {
        return true
      } else {
        return false
      }
  }

  function findOrigin(long, lat) {
      setViewPort({
        ...viewport,
        latitude: lat,
        longitude: long,
        zoom: 8
      });
  }

  function selectNewSearch(val) {
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
          "searchBorders": features,
          "circleCoordinates": circleCoordinates.current,
          "searchCentroid": searchCentroid.current
        }

    let include = [
    'west',
    'compound_code',
    'viewport',
    'width',
    'types',
    'icon_background_color',
    'place_id',
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

  function throwAnError() {
  throw new Error('testing');
}

  return (
      <div style={{ height: '100vh', flex: '1'}}>
      <div style={{flex: '1', justifyContent: 'center', display: 'flex', marginTop: '20px', fontSize: '25px', fontWeight: 'bold'}}> Google Places Search Helper </div>
      <div
        style={{flex: '1', justifyContent: 'center', display: 'flex', margin: '5px', marginBottom: '30px', fontSize: '12px', fontWeight: 'bold', color: '#0000EE', textDecorationLine: 'underline'}}
        onClick={() => alert(infoMessages["about"])}
        > About </div>

      <div style={{ display: 'flex', flexDirection: 'row'}}>



      <div style={{fontWeight:'bold', justifyContent: 'center', alignItems: 'center', flexGrow: '1', display:'flex', flex: 1}}>
      Search Metrics
      </div>

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <div style={{justifyContent: 'space-between', width: '300px', display: 'flex', flexDirection: 'column'}} >
            <div style={{textAlign:'center', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>Search Efficiency <IconButton message={infoMessages["SearchEfficiencyMessage"]}/></div>
              <input
                type="text"
                disabled={true}
                value={(efficiency*100).toFixed(4).toString()+'%'}
                style={{ padding: '5px', margin: '5px', textAlign: 'center'}}
                placeholder="Search Efficiency"
                />
          </div>

          <div style={{justifyContent: 'space-between', width: '300px', display: 'flex', flexDirection: 'column'}} >
            <div style={{textAlign:'center', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>Projected Search Cost <IconButton message={infoMessages["ProjectedSearchCostMessage"]}/></div>
              <CurrencyInput
                prefix={'$'}
                disabled={true}
                value={projectedSearchCost.toFixed(4)}
                style={{ padding: '5px', margin: '5px', textAlign: 'center'}}
                placeholder="Projected Search Cost"
                />
          </div>

          <div style={{justifyContent: 'space-between', width: '300px', display: 'flex', flexDirection: 'column'}} >
            <div style={{textAlign:'center', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>Projected Savings vs Naive Search <IconButton message={infoMessages["ProjectedSavingsVsNaiveSearchMessage"]}/></div>
              <CurrencyInput
                prefix={'$'}
                disabled={true}
                value={projectedSavings.toFixed(4)}
                style={{ padding: '5px', margin: '5px', textAlign: 'center'}}
                placeholder="Projected Savings"
                />
          </div>

        </div>
        <div style={{ flexGrow: '1'}} />
        </div>
          <div style={{marginTop: '10px', height: '2px', backgroundColor: 'black', flex: '1'}} />
          {interfaceOptions()}
          {commonSettings()}


        <div style={{display: 'flex', height: '100%', flexDirection: 'column'}}>
          <div style={{height: '100%'}}>
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

          <div style={{backdropFilter: 'blur(20px)', borderBottomRightRadius: '10px', position: 'absolute', alingSelf: 'flex-start'}}>
            <div style={{fontWeight: 'bold', paddingTop: '10px', display: 'flex', justifyContent: 'center'}}>
              {renderToolTitle()}
            </div>
            {newSearchTools()}
            {loadSearchTools()}
          </div>

        </div>
      </div>
     )
    }

export default App;
