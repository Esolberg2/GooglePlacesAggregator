import React, {
  useEffect,
  useState,
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
  // eslint-disable-next-line no-use-before-define
  const size = useWindowSize();

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

  const { buildingSearch, loading, bulkSearchRunning } = useSelector((state) => state.search);

  function useWindowSize() {
    const [windowSize, setWindowSize] = useState({
      width: undefined,
      height: undefined,
    });
    useEffect(() => {
      function handleResize() {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    return windowSize;
  }

  const renderTitle = () => {
    if (buildingSearch) {
      return 'Building New Search';
    }
    if (bulkSearchRunning) {
      return 'Running Bulk Search';
    }
    if (loading) {
      return 'Running Search';
    }
    return 'Loading';
  };

  return (
    <div
      style={{
        height: '100vh',
        flex: '1',
        width: size.width,
      }}
    >
      <SpinnerOverlay
        visible={buildingSearch || loading || bulkSearchRunning}
        title={renderTitle()}
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
          width: size.width,
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
