import React, { useEffect, useRef, useState, useCallback } from 'react'
import { googlePlacesApiManager } from './googleAPI/googlePlacesApiManager'
import SpinnerOverlay from './components/SpinnerOverlay'
import { useSelector, useDispatch } from 'react-redux'
import MapComponent from './features/map/MapComponent'
import { SettingsPanel } from './features/settingsPanel/SettingsPanel'
import 'mapbox-gl/dist/mapbox-gl.css'
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css"
import { DynamicModal } from './features/modal/Modal'
import { modalFunctionStore } from './features/modal/modalSlice'

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
          visible={buildingSearch}
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
