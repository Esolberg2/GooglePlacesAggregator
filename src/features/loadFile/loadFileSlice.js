import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadStateFromFile } from '../search/searchSlice';
import { buildModal } from '../modal/modalSlice';

const initialState = {
  fileData: {},
  fileName: '',
};

export const buildFromFile = createAsyncThunk('loadFile/buildFromFile', async (a, b) => {
  const { fileData } = b.getState().loadFile;
  const selectedAction = await buildModal(
    {
      alertKey: 'loadFile',
      // data: null,
      confirmCallback: () => {
        b.dispatch(loadStateFromFile(fileData));
      },
      denyCallback: () => {},
    },
    b.getState(),
    b.dispatch,
  );
  selectedAction();
});

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
