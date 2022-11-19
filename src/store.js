import { configureStore } from '@reduxjs/toolkit'
import mapReducer from './features/map/mapSlice'
import settingsPanelReducer from './features/settingsPanel/settingsPanelSlice'
import searchReducer from './features/search/searchSlice'
import modalReducer from './features/modal/modalSlice'

export const store = configureStore({
  reducer: {
    map: mapReducer,
    settingsPanel: settingsPanelReducer,
    search: searchReducer,
    modal: modalReducer,
  },
})

export default store
