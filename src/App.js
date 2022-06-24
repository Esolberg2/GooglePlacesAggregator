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
import axios from 'axios'
// import config from '../config'
import 'mapbox-gl/dist/mapbox-gl.css'
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css"
const CryptoJS = require("crypto-js");
const placeTypes = require('./data/placeTypes.json');

const TOKEN='pk.eyJ1IjoiZXNvbGJlcmc3NyIsImEiOiJja3l1ZmpqYWgwYzAxMnRxa3MxeHlvanVpIn0.co7_t1mXkXPRE8BOnOHJXQ'
// payload = requests.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + searchLat + ',' + searchLong + '&rankby=distance&type=' + type + '&key=' + apiKey).json()


const geolocateStyle = {
  float: 'left',
  margin: '50px',
  padding: '10px'
};

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

  // let googleScript = undefined
  let script = useRef(undefined);
  let service = useRef(undefined);

  useEffect(() => {
    window.addEventListener('beforeunload', alertUser)
    // window.addEventListener('unload', handleEndConcert)

    console.log(!script.current)
    if (!script.current) {
          console.log("script not yet defined")
          let s = document.createElement('script');
          s.type = 'text/javascript';
          s.src = `https://maps.googleapis.com/maps/api/js?key=` + apiKey + `&libraries=geometry,places`;
          s.id = 'googleMaps';
          s.async = true;
          s.defer = true;
          script.current = s
          document.body.appendChild(s);
    }


    return () => {
      window.removeEventListener('beforeunload', alertUser)
      // window.removeEventListener('unload', handleEndConcert)
    }
  }, [])

  const alertUser = e => {
    e.preventDefault()
    e.returnValue = ''
  }

  const googleScript = useRef(undefined)
  const googleData = useRef([]);
  const dataFile = useRef(undefined)
  // const searchType = useRef(undefined);
  const searchID = useRef(undefined);
  // const coordinateResolution = useRef(undefined)

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

  const [searchType, setSearchType] = useState("")
  const [userSearchKey, setUserSearchKey] = useState("");
  const [fileNameText, setFileNameText] = useState("");
  const [searchResolution, setSearchResolution] = useState(0.5)
  const [searchRunning, setSearchRunning] = useState(false)
  const [apiKey, setApiKey] = useState('AIzaSyBhJRgpD2FTMa8_q68645LQRb2qNVD6wlE')
  const [newSearch, setNewSearch] = useState(true)
  const [bulkSearchCount, setBulkSearchCount] = useState(false)
  const [searchResultLayer, setSearchResultLayer ] = useState(undefined)
  const [budget, setBudget] = useState(0)
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [mode, setMode] = useState(undefined);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(undefined);
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

  //  --- helper functions --
  function googlePlacesCall(searchLat, searchLong) {
    let apiKey = 'AIzaSyBhJRgpD2FTMa8_q68645LQRb2qNVD6wlE'
    let searchType = 'meal_takeaway'
    // import axios from 'axios'

    let urlString = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${searchLong},${searchLat}&rankby=distance&type=${searchType}&key=${apiKey}`
    axios.get(urlString)
      .then(res => {
        console.log(res)
      })
  }

  // const googleScript = document.createElement('script');
  //     googleScript.type = 'text/javascript';
  //     googleScript.src = `https://maps.googleapis.com/maps/api/js?key=` + apiKey + `&libraries=geometry,places`;
  //     googleScript.id = 'googleMaps';
  //     googleScript.async = true;
  //     googleScript.defer = true;
  //     document.body.appendChild(googleScript);
  //     googleScript.addEventListener('load', e => {
  //         this.onScriptLoad()
  //     })


  // function apiCaller() {
  function callback(results, status) {
        if (status == window.google.maps.places.PlacesServiceStatus.OK) {
          let lastLat = results[results.length-1].geometry.location.lat()
          let lastLon = results[results.length-1].geometry.location.lng()

          let from = turf.point(nextCenter.current);
          let to = turf.point([lastLon, lastLat]);
          let options = {units: 'miles'};
          let distance = turf.distance(from, to, options);
          console.log("distance", distance)
        }
  }

  function xxxx(results) {
    let lastLat = results[results.length-1].geometry.location.lat()
    let lastLon = results[results.length-1].geometry.location.lng()

    let from = turf.point(nextCenter.current);
    let to = turf.point([lastLon, lastLat]);
    let options = {units: 'miles'};
    let distance = turf.distance(from, to, options);
    // console.log("callback done")
    // await setTimeout(() => {
    //   console.log("callback done");
    // }, 2000);
    // let j;
    // for (let i = 0; i < 3000000000; i++) {
    //   j = i
    // }
    // console.log("count done", j)
    return distance
  }

  function apiCaller4() {
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
    ]

    function callback(results) {
      let lastLat = results[results.length-1].geometry.location.lat()
      let lastLon = results[results.length-1].geometry.location.lng()

      let from = turf.point(nextCenter.current);
      let to = turf.point([lastLon, lastLat]);
      let options = {units: 'miles'};
      let distance = turf.distance(from, to, options);
      radius.current = distance
      googleData.current = [...googleData.current, ...results]
      return distance
    }

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    var request = {
    location: new window.google.maps.LatLng(nextCenter.current[1],nextCenter.current[0]),
    rankBy: window.google.maps.places.RankBy.DISTANCE,
    type: searchType
    };

    return new Promise((resolve,reject)=>{
      service.nearbySearch(request,function(results,status){
          if(status === window.google.maps.places.PlacesServiceStatus.OK)
          {
              resolve(callback(results));
          }else
          {
              reject(status);
          }
      });
  })
}

  function apiCaller2() {

    function callback(results, status) {
        if (status == window.google.maps.places.PlacesServiceStatus.OK) {
          let lastLat = results[results.length-1].geometry.location.lat()
          let lastLon = results[results.length-1].geometry.location.lng()

          let from = turf.point(nextCenter.current);
          let to = turf.point([lastLon, lastLat]);
          let options = {units: 'miles'};
          let distance = turf.distance(from, to, options);
          return distance
        }
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
      ]
      // if (service.current == undefined) {
      // service.current = new window.google.maps.places.PlacesService(document.createElement('div'));
      // }

      const service = new window.google.maps.places.PlacesService(document.createElement('div'));


      var request = {
      location: new window.google.maps.LatLng(nextCenter.current[1],nextCenter.current[0]),
      rankBy: window.google.maps.places.RankBy.DISTANCE,
      type: searchType
      };

       service.nearbySearch(request, callback)
  }




  let apiCaller = () => new Promise((resolve) => {

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
    ]
    if (service.current == undefined) {
      service.current = new window.google.maps.places.PlacesService(document.createElement('div'));
    }

    var request = {
    location: new window.google.maps.LatLng(nextCenter.current[1],nextCenter.current[0]),
    rankBy: window.google.maps.places.RankBy.DISTANCE,
    type: searchType
    };

    service.current.nearbySearch(request, callback);

    function callback(results, status) {
        if (status == window.google.maps.places.PlacesServiceStatus.OK) {

          let lastLat = results[results.length-1].geometry.location.lat()
          let lastLon = results[results.length-1].geometry.location.lng()

          let from = turf.point(nextCenter.current);
          let to = turf.point([lastLon, lastLat]);
          let options = {units: 'miles'};
          let distance = turf.distance(from, to, options);

          radius.current = distance
          googleData.current = googleData.current.concat(results)
        }
      }
    })


  function googleScriptExplorer() {
    // let script = document.createElement('script');
    //     script.type = 'text/javascript';
    //     script.src = `https://maps.googleapis.com/maps/api/js?key=` + apiKey + `&libraries=geometry,places`;
    //     script.id = 'googleMaps';
    //     // script.async = true;
    //     // script.defer = true;
    //     document.body.appendChild(script);

    if (service.current == undefined) {
      service.current = new window.google.maps.places.PlacesService(document.createElement('div'));
    }

    console.log(window.google)
    console.log(service.current)

    var request = {
    location: new window.google.maps.LatLng(nextCenter.current[1],nextCenter.current[0]),
    // radius: '500',
    // types: ['store'],
    rankBy: window.google.maps.places.RankBy.DISTANCE,
    type: 'restaurant'
    };

    service.current.nearbySearch(request, callback);

    function callback(results, status) {

        if (status == window.google.maps.places.PlacesServiceStatus.OK) {
          console.log(results)
            // for (var i = 0; i < results.length; i++) {
            //     console.log(results[i].name)
            // }
        }

  }
}



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



  // --- region search ---
  function buildCircle(center, radius) {
    var options = {
      steps: 20,
      units: 'miles',
      options: {}
    };
    var radius = radius;
    console.log("----- buildCircle ----")
    console.log(center)
    console.log(typeof(center[0]))
    console.log(radius)
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


  function buildGeoJSON(coordinates) {
    return {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': coordinates
        }
    }
  }

  // function buildGeoJSON(center, radius) {
  //   let nextCircle = buildCircle(center, radius)
  //   circleCoordinates.current = nextCircle.geometry.coordinates[0]
  //   return {
  //     'type': 'Feature',
  //     'geometry': {
  //       'type': 'Polygon',
  //       'coordinates': nextCircle.geometry.coordinates
  //       }
  //   }
  // }


  function setValue() {
    if (searchRunning) {
      console.log("abort search")
      return
    } else {
        if (getPolygons().length == 0) {
          window.alert('Please use the "Select Search Area" option to choose a search region before building your search.')
          return
        }
        if (searchResolution < 0.1 || !searchResolution) {
          window.alert('Please enter a value for the "Search Resolution".  This is the distance in miles between each potential search coordinate that will be evaluated.')
          return
        }
        if (searchType == "Select") {
          window.alert('Please select an "Entity Type" before building your search.  This is the type of Google Places Entity that the Places API will search for.')
          return
        }
        putPostData('POST', `/setUserSearch`,
          {
            "searchRegions": getPolygons(),
            "searchID": undefined,
            "coordinateResolution": searchResolution
            }).then(data => {
                searchedData.current = data["searchedCoords"]
                unsearchedData.current = data["unsearchedCoords"]
                nextCenter.current = data["furthestNearest"]
                searchID.current = data["searchID"]["lastRowID"]
                let border = data["border"]
                console.log(border)
                addCoordinates(data["unsearchedCoords"], coordinatesFeatures, setCoordinatesFeatures)
                addCoordinates(data["searchedCoords"], searchedCoordinatesFeatures, setSearchedCoordinatesFeatures)
                // dummyGoogleCall()
                // apiCaller()
                // add circle
                // addCircle()
            })
        }
  }

  function clearShapes() {
    let features = editorRef.current.getFeatures()
    for (let i=0; i < features.length; i++) {
      editorRef.current.deleteFeatures(i)
    }
  }

  function clearData() {
    let features = editorRef.current.getFeatures()
    for (let i=0; i < features.length; i++) {
      editorRef.current.deleteFeatures(i)
    }

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

  const newFeature = {
    "type": "Feature",
    "properties": {},
    "geometry": {
        "type": "Polygon",
        "coordinates": [
            [
                [
                    -71.16116969569079,
                    42.32778820561197
                ],
                [
                    -71.14994789273689,
                    42.312679640574856
                ],
                [
                    -71.14793801758066,
                    42.32989320948443
                ],
                [
                    -71.16116969569079,
                    42.32778820561197
                ]
            ]
        ]
    }
}
  function printState() {
    console.log("")
    console.log("")
    console.log("")
    console.log(Object.getOwnPropertyNames(CurrencyInput))
    console.log("editorRef.current")
    console.log(editorRef.current.getFeatures())
    // editorRef.current.addFeatures(newFeature)
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
  }

  function getNextSearchCoord1() {
    // radius.current = dummyGoogleCall()
    putPostData('POST', `/getNextSearch`,
    {
      // "searchedData": searchedData.current,
      // "unsearchedData": unsearchedData.current,
      "lastCenter": nextCenter.current,
      "lastRadius": radius.current,
      "circleCoordinates": circleCoordinates.current,
      "searchID": searchID.current,
      "checksum": checksum(checksumDataBundler())
    }).then(data => {
        if (data["checksumStatus"] == -1) {
          console.log("!!!! checksum mismatch !!!!")
          // reload data file
          return
        }

        nextCenter.current = data["center"]
        searchedData.current = data["searched"]
        unsearchedData.current = data["unsearched"]

        let prevSearchedCoords = [...searchedCoordinatesFeatures.features]
        let newSearchedCoordinates = []

        data["newlySearchedCoordinates"].forEach((coord, i) => {
          newSearchedCoordinates.push(buildCoord(coord))
        })

        newSearchedCoordinates = newSearchedCoordinates.concat(prevSearchedCoords)
        setSearchedCoordinatesFeatures((prevValue) => ({ ...prevValue, features: newSearchedCoordinates }));

      })
    }

    let getNextSearchCoord = () => new Promise((resolve) => {
      console.log("getNextSearchCoord")
        putPostData('POST', `/getNextSearch`,
        {
          "lastCenter": nextCenter.current,
          "lastRadius": radius.current,
          "circleCoordinates": circleCoordinates.current,
          "searchID": searchID.current,
          "checksum": checksum(checksumDataBundler())
        }).then(data => {

            if (data["checksumStatus"] == -1) {
              console.log("!!!! checksum mismatch !!!!")
              return
            }
            console.log("--------")
            console.log("last center")
            console.log(nextCenter.current)
            console.log("")
            console.log("next center")
            console.log(data["center"])
            console.log("--------")
            nextCenter.current = data["center"]
            searchedData.current = data["searched"]
            unsearchedData.current = data["unsearched"]

            let prevSearchedCoords = [...searchedCoordinatesFeatures.features]
            let newSearchedCoordinates = []

            data["newlySearchedCoordinates"].forEach((coord, i) => {
              newSearchedCoordinates.push(buildCoord(coord))
            })

            newSearchedCoordinates = newSearchedCoordinates.concat(prevSearchedCoords)
            setSearchedCoordinatesFeatures((prevValue) => ({ ...prevValue, features: newSearchedCoordinates }));
            console.log("getNextSearchCoord Complete")
            resolve("ok")
          })
    }
)
    // let getNextSearchCoord = new Promise (() => {
    //   console.log("getNextSearchCoord")
    //     putPostData('POST', `/getNextSearch`,
    //     {
    //       "lastCenter": nextCenter.current,
    //       "lastRadius": radius.current,
    //       "circleCoordinates": circleCoordinates.current,
    //       "searchID": searchID.current,
    //       "checksum": checksum(checksumDataBundler())
    //     }).then(data => {
    //
    //         if (data["checksumStatus"] == -1) {
    //           console.log("!!!! checksum mismatch !!!!")
    //           return
    //         }
    //         console.log("--------")
    //         console.log("last center")
    //         console.log(nextCenter.current)
    //         console.log("")
    //         console.log("next center")
    //         console.log(data["center"])
    //         console.log("--------")
    //         nextCenter.current = data["center"]
    //         searchedData.current = data["searched"]
    //         unsearchedData.current = data["unsearched"]
    //
    //         let prevSearchedCoords = [...searchedCoordinatesFeatures.features]
    //         let newSearchedCoordinates = []
    //
    //         data["newlySearchedCoordinates"].forEach((coord, i) => {
    //           newSearchedCoordinates.push(buildCoordJSON(coord))
    //         })
    //
    //         newSearchedCoordinates = newSearchedCoordinates.concat(prevSearchedCoords)
    //         setSearchedCoordinatesFeatures((prevValue) => ({ ...prevValue, features: newSearchedCoordinates }));
    //         console.log("getNextSearchCoord Complete")
    //       })
    // })



      function dummyGoogleCall(center) {
        // let urlString = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${nextCenter.current[1]},${nextCenter.current[0]}&rankby=distance&type=${searchType}&key=${apiKey}`
        // let responseData = ('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + searchLat + ',' + searchLong + '&rankby=distance&type=' + type + '&key=' + apiKey).json()
        // console.log(urlString)
        // let responseData = fetch(urlString).then(data => {
        //     console.log(data)
        //   })
        // console.log(responseData)
        // let furthestLatLon = responseData[responseData.length-1]["geometry"]["location"]
        //
        // let calcedRadius = Math.hypot(furthestLatLon["lat"]-nextCenter.current[1], furthestLatLon["lng"]-nextCenter.current[0])

        // radius.current = Math.random() * (3 - .5) + .5;
      }

  function dummyGoogleCall(center) {
    return new Promise((resolve) => {
      radius.current = Math.random() * (3 - .5) + .5;
      resolve("ok")
    })
    // radius.current = Math.random() * (3 - .5) + .5;
  }

  // add a data polygon json object for each coordinate in list of coordinates passed.
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


  function addCircle() {
    console.log("addCircle")
    console.log("nextCenter.current in addCircle")
    console.log(nextCenter.current)
    let circleJson = buildCircle(nextCenter.current, radius.current)
    let newFeatures = [...searchedAreas.features]
    newFeatures.push(circleJson)
    setSearchedAreas((prevValue) => ({ ...prevValue, features: newFeatures }));

  }

  function callGoogleAPI() {
    console.log('google api call')
    // place call to google api
    // add resutlts to googleData ref
    // calculate radius
    // return radius
  }

  function getPolygons() {
    let data = editorRef.current.getFeatures()
    let result = data.map(currentElement => currentElement.geometry.coordinates[0]);
    return result
  }

  function search() {
    if (budget <= budgetUsed) {
      console.log("budget limit reached")
      window.alert("You set budget has been met.  Please increase your Budget setting if you would like to continue using the Google API.")
      return
    }
    if (searchRunning) {
      console.log("abort search")
      return
    } else {
      setSearchRunning((prev) => true)
      getNextSearchCoord().then(() => {
        console.log('-------update budget------')
        console.log(typeof(budgetUsed));
        setBudgetUsed((prev) => (parseFloat(prev) + 0.032).toFixed(4))
        if (unsearchedData.current.length == 0) {
          console.log("search area complete")
          return
        } else {
          // dummyGoogleCall(nextCenter);
          apiCaller4().then(() => addCircle())
          // addCircle();

          console.log("complete search")
          setSearchRunning((prev) => false)
        }
      })
    }
    // addCircle()
    // gets the radius
    // await dummyGoogleCall()
    // add circle
    // addCircle()
  }

  function loadFile(value) {
    let fileReader;

    const handleFileRead = (e) => {
      const content = fileReader.result;
      dataFile.current = content
      console.log(content)
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

  // googleData.current = dataFile.current["googleData"]
  // searchType.current = dataFile.current["searchType"]
  // searchID.current = dataFile.current["searchID"]
  // coordinateResolution = dataFile.current["resolution"]
  // searchedData = dataFile.current["searchedData"]
  // unsearchedData = dataFile.current["unSearchedData"]
  // nextCenter = dataFile.current["nextCenter"]
  // userSearchKey = dataFile.current["userSearchKey"]
  //
  // "budget": budget,
  // "budgetUsed": budgetUsed,

  function packageData() {
    // let searchDataObject = {}
    // searchDataObject[searchID.current]
    let searchDataObject = {
          "searchedData": searchedData.current,
          "unsearchedData": unsearchedData.current,
          "googleData": googleData.current,
          "searchType": searchType,
          "budget": budget,
          "budgetUsed": budgetUsed,
          "resolution": searchResolution,
          "userSearchKey": userSearchKey,
          "nextCenter": nextCenter.current,
          "searchID": searchID.current
        }
        return searchDataObject
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
  const selectedFeature =
    features && (features[selectedFeatureIndex] || features[features.length - 1]);
  const _onViewportChange = viewport => setViewPort({...viewport, transitionDuration: 0 })


  const downloadFile = ({ data, fileName, fileType }) => {
    // Create a blob with the data we want to download as a file
    const blob = new Blob([data], { type: fileType })
    // Create an anchor element and dispatch a click event on it
    // to trigger a download
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
    // check if the loaded file exists, and that it has valid data fields.

    // searchedData
    // unsearchedData
    // searchType
    // budget
    // budgetUsed
    // resolution
    // userSearchKey
    // nextCenter
    // searchID
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
      // data["newlySearchedCoordinates"].forEach((coord, i) => {
      //   newSearchedCoordinates.push(buildCoord(coord))
      // })
      // addCoordinates(unsearchedData.current, coordinatesFeatures, setCoordinatesFeatures)
      // addCoordinates(searchedData.current, searchedCoordinatesFeatures, setSearchedCoordinatesFeatures)
      // addCoordinates(searchedData.current, searchedAreas, setSearchedAreas)

    } catch(error){
      console.log(error)
      }
    }


    // if (dataFile.current & "googleData" in dataFile.current) {
    //   googleData = dataFile.current["googleData"]
    // }
    // console.log('sync server to file data')
  // }

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
          // defaultValue={searchResolution ? searchResolution : `Loaded from File ${searchResolution}`}
          // readOnly={true}
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
                    }
                  }}
                  style={{padding: '5px', margin: '5px', backgroundColor: newSearch ? '#cccccc' : undefined }}
                  >
                  New Search
                </button>
                <button
                  onClick={() => {
                    if (newSearch) {
                      selectNewSearch(false)
                    }
                  }}
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


            <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', width: '125px'}}>
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


            <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', width: '125px'}}>
              Enter Google API Key

              <div style={{ paddingTop: '10px', fontSize: '12px', display: 'flex', textAlign: 'center', justifyContent: 'center'}}>
                The Key will not be saved and is only used to call the google places API directly.
              </div>

              <div style={{ flexGrow: '1'}}/>

                <input
                  value={apiKey}
                  onChange={(e) => onChangeAPIkeyInput(e)}
                  style={{ height: '15px', paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', textAlign: 'center'}}
                  placeholder="Google API Key"
                  />
            </div>

            <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', width: '125px'}}>
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


            <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', width: '125px'}}>
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



            <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', width: '125px'}}>
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
              }
            }>

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
                    onClick={() => search()}
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
              }
            }>

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
                    onClick={() => setValue()}
                    style={{padding: '5px', margin: '5px', width: '150px'}}
                    >
                    Build Search
                    </button>
                  <button
                    onClick={() => search()}
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


  function selectNewSearch1() {
    if (editorRef.current.getFeatures().length > 0 || googleData.current.length || searchedData.current || unsearchedData.current) {
      let selection = window.confirm(
        "WARNING: Data is present from an in progress search session." +
        " If you continue, this data will be lost.  Please use the 'Download Data'"+
        " option if you wish to keep this information."
      )
      if (selection) {
        // ref reset
        clearShapes()
        googleData.current = undefined
        setSearchType(undefined)
        searchID.current = undefined
        searchedData.current = undefined
        circleCoordinates.current = undefined
        nextCenter.current = undefined
        radius.current = undefined
        circleCoordinates.current = undefined

        // state reset
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

        setNewSearch((prev) => !prev)
      }
    } else {
      setNewSearch((prev) => !prev)
    }
  }

  const exportToJson = e => {
    e.preventDefault()
    let datetime = new Date().toLocaleString();
    // const replacer = (key, value) => typeof value === 'undefined' ? null : value;

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
          "searchBorders": editorRef.current.getFeatures()
        }
    console.log("--- searchedAreas ----")
    console.log(searchedAreas)
    // let searchDataObject = {
    //     "searchID": searchID.current,
    //     "searchedData": searchedData.current,
    //     "unsearchedData": unsearchedData.current,
    //     "googleData": googleData.current,
    //     "searchType": searchType.current,
    //     "budget": budget.current,
    //     "budgetUsed": budgetUsed.current,
    //     "userSearchKey": userSearchKey
    //   }
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

    // let include = [
    // 'west',
    // 'compound_code',
    // 'viewport',
    // 'width',
    // 'types',
    // 'icon_background_color',
    // 'place_id',
    // // 'isOpen',
    // 'east',
    // 'opening_hours',
    // 'name',
    // 'reference',
    // 'photos',
    // 'height',
    // 'south',
    // 'getUrl',
    // 'north',
    // 'rating',
    // 'lng',
    // 'icon',
    // 'html_attributions',
    // 'geometry',
    // 'location',
    // 'scope',
    // 'lat',
    // 'vicinity',
    // 'plus_code',
    // 'user_ratings_total',
    // 'global_code',
    // 'icon_mask_base_uri',
    // 'price_level',
    // 'business_status',
    // "searchedData",
    // "unsearchedData",
    // "searchedAreas",
    // "googleData",
    // "searchType",
    // "budget",
    // "budgetUsed",
    // "resolution",
    // "userSearchKey",
    // "nextCenter",
    // "searchID",
    // "searchBorders"
    // ]
    let d = JSON.stringify(searchDataObject, include)
    // console.log(d)
    downloadFile({
      data: JSON.stringify(searchDataObject, include),
      fileName: `${searchType}_${userSearchKey}_${datetime}.json`,
      fileType: 'text/json',
    })
  }




  function jsonStringifyTest() {
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
    ]

    for (const d of googleData.current.slice(20)) {
      console.log(d["name"])
    }
    let j = JSON.stringify(googleData.current, include)
    // console.log(j)
  }

  function renderToolTile() {
    if (newSearch) {
      return 'New Search'
    }
    return 'Existing Search'
  }

  // <script async
  //   src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`}
  //   id='googleImport'
  //   >
  // </script>


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
      <div style={{ height: '100vh', flex: '1'}}>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between'

            }}>



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
                onClick={() => jsonStringifyTest()}
                >
                jsonStringifyTest
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
              onClick={() =>  googlePlacesCall('-71.0112371727878', '43.968510619528146')}
              >
              googlePlacesCall
              </button>
              <button
                style={{height: '30px', width : '100px'}}
                onClick={() => apiCaller4().then((data) => console.log(data))}
                >
                apiCaller
                </button>
          </div>
          <div style={{ height: '50px'}}/>

          {commonSettings()}

          <div style={{padding: '10px', display: 'flex', justifyContent: 'center'}}>
          {renderToolTile()}
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
