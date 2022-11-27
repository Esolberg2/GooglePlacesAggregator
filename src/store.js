import { configureStore } from '@reduxjs/toolkit'
import mapReducer from './features/map/mapSlice'
import settingsPanelReducer from './features/settingsPanel/settingsPanelSlice'
import searchReducer from './features/search/searchSlice'
import modalReducer from './features/modal/modalSlice'
import loadFileReducer from './features/loadFile/loadFileSlice'

export const store = configureStore({
  reducer: {
    map: mapReducer,
    settingsPanel: settingsPanelReducer,
    search: searchReducer,
    modal: modalReducer,
    loadFile: loadFileReducer,
  },
})

export default store
