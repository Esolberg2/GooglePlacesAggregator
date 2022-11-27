import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  fileData: {},
  fileName: ''
}


// ============ Reducers ====================
export const loadFileSlice = createSlice({
  name: 'loadFileSlice',
  initialState,
  reducers: {
    setFileData: (state, action) => {state.fileData = action.payload},
    setFileName: (state, action) => {state.fileName = action.payload},
  },
})

// export const searchActions = loadFileSlice.actions
export const {
  setFileData,
  setFileName
} = loadFileSlice.actions

export default loadFileSlice.reducer
