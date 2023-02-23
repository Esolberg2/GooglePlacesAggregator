import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fileData: {},
  fileName: '',
};

export const loadFileSlice = createSlice({
  name: 'loadFileSlice',
  initialState,
  reducers: {
    setFileData: (state, action) => { state.fileData = action.payload; },
    setFileName: (state, action) => { state.fileName = action.payload; },
  },
});

export const {
  setFileData,
  setFileName,
} = loadFileSlice.actions;

export default loadFileSlice.reducer;
