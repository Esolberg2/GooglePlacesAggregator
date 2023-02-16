import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { useSelector, useDispatch } from 'react-redux'
import { alertManager } from '../../alerts/alertManager'
import { store } from '../../store'

const initialState = {
  visible: false,
  error: false,
  message: '',
  callbackKey: '',
  dialogType: '',
  promise: '',
  dialogTitle: ''
}

class ModalFunctionStore {
  constructor() {
    this.resolve = undefined
    this.reject = undefined
  }
}

export const modalFunctionStore = new ModalFunctionStore()

export const callbackDict = {}

export async function buildModal(kwargs) {

  let {
    alertKey,
    data,
    confirmCallback,
    denyCallback,
  } = kwargs

  let alert = alertManager.hasAlert(alertKey, data)
  console.log("alert status", alert)

  const promise = new Promise(function(resolve, reject){
    modalFunctionStore.resolve = () => {
      console.log("store resolve")
      store.dispatch(setMessage(''))
      store.dispatch(setDialogType(false))
      store.dispatch(setVisible(false))
      store.dispatch(setDialogTitle(''))
      console.log(confirmCallback)
      resolve(confirmCallback)
    }
    modalFunctionStore.reject = () => {
      console.log("store reject")
      store.dispatch(setMessage(''))
      store.dispatch(setDialogType(false))
      store.dispatch(setDialogTitle(''))
      store.dispatch(setVisible(false))
      console.log(denyCallback)
      reject(denyCallback)
    }
  })
  console.log("promises set")

  let output;

  if (alert) {
    store.dispatch(setMessage(alert.text))
    store.dispatch(setDialogType(alert.type))
    store.dispatch(setDialogTitle(alert.title))
    store.dispatch(setVisible(true))
  }

  else {
    modalFunctionStore.resolve()
  }
  return promise
}

export const modalDialog = createAsyncThunk('modal/modalPromise', async (args, b) => {
  console.log("modalDialog")
  let { alertKey, data } = args
  let alert = alertManager.hasAlert(alertKey, data)
  console.log(data)
  console.log(alert)
  if (alert) {
    b.dispatch(setMessage(alert.text))
    b.dispatch(setDialogType(alert.type))
    b.dispatch(setVisible(true))
    console.log("building promise")

    const promise = new Promise(function(resolve, reject){
      modalFunctionStore.resolve = resolve()
      callbackDict.reject = reject()
    })

    console.log("alert processed, returning modal results")
    return promise

  } else {
    console.log("no alert, returning")
    return
  }
})

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(modalDialog.fulfilled, (state, action) => {
      state.visible = false
      state.message = ''
      state.dialogType = ''
    })
    builder.addCase(modalDialog.rejected, (state, action) => {
      state.visible = false
      state.message = ''
      state.dialogType = ''
    })
  },
  reducers: {
  setDialogTitle: (state, action) => {state.dialogTitle = action.payload},
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
setDialogTitle,
} = modalSlice.actions

export default modalSlice.reducer
