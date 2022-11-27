import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { useSelector, useDispatch } from 'react-redux'
import { alertManager } from '../../alerts/alertManager'

const initialState = {
  visible: false,
  error: false,
  message: '',
  callbackKey: '',
  dialogType: '',
  promise: ''
}

export const callbackDict = {}

export const confirmationDialog = createAsyncThunk('modal/confirmPromise', async (args, b) => {
  let { target, message } = args
  b.dispatch(setMessage('test message'))
  b.dispatch(setDialogType('Confirmation'))
  b.dispatch(setVisible(true))
  const confirmed = await new Promise(function(resolve, reject){
    callbackDict["resolve"] = resolve;
  });

  if (confirmed) {
    target()
    // b.dispatch(target())
  }
})


export const alertDialog = createAsyncThunk('modal/alertPromise', async (args, b) => {
  let { target, alertKey, data } = args
  let alert = alertManager.hasAlert(alertKey, data)
  if (alert) {
    b.dispatch(setMessage(alert))
    b.dispatch(setDialogType('Alert'))
    b.dispatch(setVisible(true))
    const promise = await new Promise(function(resolve, reject){
      callbackDict["resolve"] = () => {resolve(true)};
    });
    return true
  } else {
    console.log("should forward to action")
    console.log(args)
    try {
      target()
    }
    catch (error) {
      console.log(error)
    }

    // b.dispatch(target())
  }
})


export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(alertDialog.fulfilled, (state, action) => {
      state.visible = false
      state.message = ''
      state.dialogType = ''
    })
    builder.addCase(confirmationDialog.fulfilled, (state, action) => {
      state.visible = false
      state.message = ''
      state.dialogType = ''
    })
  },
  reducers: {
  setDialogType: (state, action) => {state.dialogType = action.payload},
  setMessage: (state, action) => {state.message = action.payload},
  setVisible: (state, action) => {state.visible = action.payload},
}
})


export const
{
setVisible,
setMessage,
setDialogType,
} = modalSlice.actions

export default modalSlice.reducer
