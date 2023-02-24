import React, {
  useEffect,
} from 'react';
import { useSelector } from 'react-redux';
import SpinnerOverlay from './components/SpinnerOverlay';
import MapComponent from './features/map/MapComponent';
import SettingsPanel from './features/settingsPanel/SettingsPanel';
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import DynamicModal from './features/modal/Modal';
import { modalFunctionStore } from './features/modal/modalSlice';

function App() {
  const saveBeforeLeaving = (e) => {
    e.preventDefault();
    e.returnValue = '';
  };

  useEffect(() => {
    window.addEventListener('beforeunload', saveBeforeLeaving);
    return () => {
      window.removeEventListener('beforeunload', saveBeforeLeaving);
    };
  }, []);

  const buildingSearch = useSelector((state) => state.search.buildingSearch);

  return (
    <div
      style={{
        height: '100vh',
        flex: '1',
      }}
    >
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
      <SettingsPanel />
      <div
        style={{
          marginTop: '10px',
          height: '2px',
          backgroundColor: 'black',
          flex: '1',
        }}
      />
      <div
        style={{
          display: 'flex',
          height: '100%',
          flexDirection: 'column',
        }}
      >
        <MapComponent />
      </div>
    </div>
  );
}

export default App;
