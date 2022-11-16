import { configureStore } from '@reduxjs/toolkit'
import mapReducer from './features/map/mapSlice'
import settingsPanelReducer from './features/settingsPanel/settingsPanelSlice'
import buildSearchReducer from './features/search/buildSearchSlice'
import searchReducer from './features/search/searchSlice'

export const store = configureStore({
  reducer: {
    map: mapReducer,
    settingsPanel: settingsPanelReducer,
    buildSearch: buildSearchReducer,
    search: searchReducer,
  },
})

export default store
