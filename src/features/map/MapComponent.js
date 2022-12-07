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
import { ModalBuilder } from '../modal/ModalBuilder'
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

  // function modalBuilder(alertKey, targetObj, callbackObj, errorObj) {
  //   let modal = dispatch(modalDialog({
  //     "target": () => {dispatch(targetObj.func(...targetObj.args))},
  //     "alertKey": alertKey,
  //   }))
  //   .then(unwrapResult)
  //   .then((result) => {callbackObj.func(result, ...callbackObj.args)})
  //   .catch((error) => {errorObj.func(error, ...errorObj.args)})
  // }

  // function modalBuilder(args) {
  //   let { alertKey, target, callback, errorBack } = args
  //   console.log("modalBuilder run")
  //   let modal = dispatch(modalDialog({
  //     "target": target,
  //     "alertKey": alertKey,
  //   }))
  //   .then(unwrapResult)
  //   .then((result) => {callback(result)})
  //   .catch((error) => {errorBack(error)})
  // }

  function buildFromFile() {
    let modalBuilder = new ModalBuilder()
    modalBuilder.alertKey = 'loadFile'
    modalBuilder.callback = (result) => {
        console.log("resolve callback run")
        dispatch(loadStateFromFile(fileData))
        editorRef.current.state.featureCollection.featureCollection.features = []
        editorRef.current.addFeatures(fileData.mapPolygons)
      }
    modalBuilder.errorback = (error) => {
        console.log("reject callback run")
        console.log(error)
      }
    modalBuilder.run()
  }

  // async function buildFromFile() {
  //   modalBuilder({
  //     alertKey: "loadFile",
  //     target: ()=> {dispatch(loadStateFromFile(fileData))},
  //     callback: (result) => {
  //         console.log("resolve callback run")
  //         editorRef.current.state.featureCollection.featureCollection.features = []
  //         editorRef.current.addFeatures(fileData.mapPolygons)
  //       },
  //     errorBack: (error) => {
  //         console.log("reject callback run")
  //         console.log(error)
  //       }
  //     })}

  // async function buildFromFile() {
  //   dispatch(modalBuilder({
  //     alertKey: "loadFile",
  //     targetObj: {func: loadStateFromFile, args: [fileData]},
  //     callbackObj: {func: (result) => {
  //         console.log("resolve callback run")
  //         editorRef.current.state.featureCollection.featureCollection.features = []
  //         editorRef.current.addFeatures(fileData.mapPolygons)
  //       },
  //       args: []
  //     },
  //     errorObj: {func: (error) => {
  //         console.log("reject callback run")
  //         console.log(error)
  //       },
  //       args: []
  //     },
  //   }))

    //   "loadFile",
    //   {func: loadStateFromFile, args: [fileData]},
    //   {func: (result) => {
    //       editorRef.current.state.featureCollection.featureCollection.features = []
    //       editorRef.current.addFeatures(fileData.mapPolygons)
    //     },
    //     args: []
    //   },
    //   {func: (error) => {
    //       console.log(error)
    //     },
    //     args: []
    //   }
    // )
  // }


  // async function buildFromFile() {
  //
  //   let alert = dispatch(modalDialog({
  //     "target": () => {dispatch(loadStateFromFile(fileData))},
  //     "alertKey": "loadFile",
  //   }))
  //   .then(unwrapResult)
  //   .then((res) => {
  //     editorRef.current.state.featureCollection.featureCollection.features = []
  //     editorRef.current.addFeatures(fileData.mapPolygons)
  //   })
  //   .catch(() => {console.log("catchedded")})
  //
  // }

  // function search() {
  //   dispatch(alertDialog(
  //     {
  //       "target": () => {dispatch(nearbySearch())},
  //       "alertKey": "search"
  //     }
  //   ))
  // }


  function search() {
    let modalBuilder = new ModalBuilder()
    modalBuilder.alertKey = 'search'
    modalBuilder.callback = () => {dispatch(nearbySearch())}
    modalBuilder.errorback = (error) => {
        console.log("reject callback run")
        console.log(error)
      }
    modalBuilder.run()
  }

  function debouncedSearch() {
    dispatch(debounce(search))
  }

  // function buildSearch() {
  //   dispatch(alertDialog(
  //     {
  //       "target": () => {dispatch(initializeSearch())},
  //       "alertKey": "buildSearch"
  //     }
  //   ))
  // }

  function buildSearch() {
    let modalBuilder = new ModalBuilder()
    modalBuilder.alertKey = 'buildSearch'
    modalBuilder.callback = () => {dispatch(initializeSearch())}
    modalBuilder.errorback = (error) => {
        console.log("reject callback run")
        console.log(error)
      }
    modalBuilder.run()
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
