import React, { useEffect, useRef, useState, useCallback } from 'react'
import { googlePlacesApiManager } from './googleAPI/googlePlacesApiManager'
import { SpinnerOverlay } from './components/SpinnerOverlay'
import { useSelector, useDispatch } from 'react-redux'
import { setPolygonCoordinates } from './features/map/mapSlice'
import { settingsPanelActions } from './features/settingsPanel/settingsPanelSlice'
import { MapComponent } from './features/map/MapComponent'
import { styles } from './style'
import { SettingsPanel } from './features/settingsPanel/SettingsPanel'
import { alertManager } from './alerts/alertManager'
import { BsFillQuestionCircleFill } from 'react-icons/bs';
import MapGL, {GeolocateControl, Source, Layer } from 'react-map-gl'
import DeckGL, { GeoJsonLayer } from "deck.gl";
import Geocoder from "react-map-gl-geocoder";
import { Editor, DrawPolygonMode, EditingMode } from 'react-map-gl-draw';
import { getFeatureStyle, getEditHandleStyle } from './style';
import * as turf from '@turf/turf'
import CurrencyInput from 'react-currency-input-field';
// import { FilePicker } from './components/FilePicker.js'
import { SettingsButton } from './components/SettingsButton.js'
import { SettingsTextContainer } from './components/SettingsTextContainer.js'
import SpinnerButton from './components/SpinnerButton.js'
import IconButton from './components/IconButton.js'
import axios from 'axios'
import 'mapbox-gl/dist/mapbox-gl.css'
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css"
import { initializeSearch as initializeSearchSlice } from './features/search/searchSlice'
import { loadStateFromFile, setBulkSearchCount, setPriorSearch } from './features/search/searchSlice'
import { mapActions } from './features/map/mapSlice'
import { ConfirmationModal } from './features/modal/Confirmation'
import { AlertModal } from './features/modal/Alert'
import { DynamicModal } from './features/modal/Modal'
import { modalFunctionStore } from './features/modal/modalSlice'
const CryptoJS = require("crypto-js");
const placeTypes = require('./data/placeTypes.json');
const infoMessages = require('./data/informationText.json');

const App = () => {

  const dispatch = useDispatch()
  const searchData = useSelector((state) => state.search)
  const settingsData = useSelector((state) => state.settingsPanel)
  const mapData = useSelector(state => state.map)

  useEffect(() => {
    window.addEventListener('beforeunload', saveBeforeLeaving)
    return () => {
      window.removeEventListener('beforeunload', saveBeforeLeaving)
    }
  }, [])

  const saveBeforeLeaving = e => {
    e.preventDefault()
    e.returnValue = ''
  }

  const editorRef = useRef(undefined);

  const buildingSearch = useSelector((state) => state.search.buildingSearch)
  const googlePlacesLibLoading = useSelector((state) => state.search.googlePlacesLibLoading)

  return (
      <div style={{height: '100vh', flex: '1'}}>
        <SpinnerOverlay
          visible={buildingSearch || googlePlacesLibLoading}
        />
        <DynamicModal
          confirmCallback={modalFunctionStore.resolve}
          rejectCallback={modalFunctionStore.reject}
          message={useSelector((state) => state.modal.message)}
          visible={useSelector((state) => state.modal.visible)}
          title={useSelector((state) => state.modal.dialogTitle)}
        />
        <SettingsPanel/>
        <div style={{marginTop: '10px', height: '2px', backgroundColor: 'black', flex: '1'}} />
        <div style={{display: 'flex', height: '100%', flexDirection: 'column'}}>
          <MapComponent ref={editorRef}/>
        </div>
      </div>
     )
    }

export default App;
