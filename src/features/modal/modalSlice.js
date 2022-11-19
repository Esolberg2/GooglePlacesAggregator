import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { DialogModal } from './Modal'

const initialState = {
  visible: false,
  error: false,
  message: ''
}


export const testModal = createAsyncThunk('modal/testModal',(a, b) => {
  return (
    <DialogModal closeCallback={() => {console.log("closeCallback")}} type={"Warning"} />

  )
})

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  // extraReducers: {
  //   ["search/nearbySearch/fulfilled"]: (state, action) => {
  //
  //     state.searchedAreas.features = [...state.searchedAreas.features, buildCoordJSON(action.payload.lastSearchPerimeter)]
  //   }
  // },
  reducers: {
    setVisible: (state, action) => {state.visible = action.payload},
  },

})

export const
{
setVisible
} = modalSlice.actions

export default modalSlice.reducer
