import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

export const wrapperSlice = createSlice({
  name: 'stateWrapper',
  initialState,
  reducers: {
    reset: () => {},
  },
});

export const wrapperActions = wrapperSlice.actions;
export default wrapperSlice.reducer;
