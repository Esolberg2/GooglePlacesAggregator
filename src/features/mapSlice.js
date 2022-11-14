import { createSlice } from '@reduxjs/toolkit'

const initialState = {

}

export const mapSlice = createSlice({
  name: 'map',
  initialState,

  reducers: {
    increment: (state, action) => {
      state.value += 1
    },

  },

})

// Action creators are generated for each case reducer function
export mapActions = mapSlice.actions

export default mapSlice.reducer
