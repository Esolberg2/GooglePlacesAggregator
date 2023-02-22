import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import alertManager from '../../alerts/alertManager';
import store from '../../store';

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

  const promise = new Promise(function(resolve, reject){
    modalFunctionStore.resolve = () => {
      store.dispatch(setMessage(''))
      store.dispatch(setDialogType(false))
      store.dispatch(setVisible(false))
      store.dispatch(setDialogTitle(''))
      resolve(confirmCallback)
    }
    modalFunctionStore.reject = () => {
      store.dispatch(setMessage(''))
      store.dispatch(setDialogType(false))
      store.dispatch(setDialogTitle(''))
      store.dispatch(setVisible(false))
      reject(denyCallback)
    }
  })

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
  let { alertKey, data } = args
  let alert = alertManager.hasAlert(alertKey, data)
  if (alert) {
    b.dispatch(setMessage(alert.text))
    b.dispatch(setDialogType(alert.type))
    b.dispatch(setVisible(true))

    const promise = new Promise(function(resolve, reject){
      modalFunctionStore.resolve = resolve()
      callbackDict.reject = reject()
    })

    return promise

  } else {
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
