import { configureStore, combineReducers } from '@reduxjs/toolkit';
import mapReducer from './features/map/mapSlice';
import settingsPanelReducer from './features/settingsPanel/settingsPanelSlice';
import searchReducer from './features/search/searchSlice';
import modalReducer from './features/modal/modalSlice';
import loadFileReducer from './features/loadFile/loadFileSlice';
import stateWrapperReducer from './features/stateWrapper/wrapperSlice';

const combinedReducer = combineReducers({
  map: mapReducer,
  settingsPanel: settingsPanelReducer,
  search: searchReducer,
  modal: modalReducer,
  loadFile: loadFileReducer,
  stateWrapper: stateWrapperReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'stateWrapper/reset') {
    state = undefined;
  }
  return combinedReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
});

if (window.Cypress) {
  window.store = store;
}

export default store;
