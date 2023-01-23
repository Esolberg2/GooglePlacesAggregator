import { configureStore, combineReducers } from '@reduxjs/toolkit'
import mapReducer from './features/map/mapSlice'
import settingsPanelReducer from './features/settingsPanel/settingsPanelSlice'
import searchReducer from './features/search/searchSlice'
import modalReducer from './features/modal/modalSlice'
import loadFileReducer from './features/loadFile/loadFileSlice'
import stateWrapperReducer from './features/stateWrapper/wrapperSlice'
// export const store = configureStore({
//   reducer: {
//     map: mapReducer,
//     settingsPanel: settingsPanelReducer,
//     search: searchReducer,
//     modal: modalReducer,
//     loadFile: loadFileReducer,
//   },
// })

const combinedReducer = combineReducers({
  map: mapReducer,
  settingsPanel: settingsPanelReducer,
  search: searchReducer,
  modal: modalReducer,
  loadFile: loadFileReducer,
  stateWrapper: stateWrapperReducer,
})

const rootReducer = (state, action) => {
  console.log("root reducer action", action.type)
  if (action.type === 'stateWrapper/reset') {
    console.log("root reducer reset")
    state = undefined
  }
  return combinedReducer(state, action)
}


export const store = configureStore({
  reducer: rootReducer,
})


export default store
