import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { useSelector, useDispatch } from 'react-redux'
import { alertManager } from '../../alerts/alertManager'
import { unwrapResult } from '@reduxjs/toolkit'

const initialState = {
  visible: false,
  error: false,
  message: '',
  callbackKey: '',
  dialogType: '',
  promise: ''
}

export const callbackDict = {}

// export const confirmationDialog = createAsyncThunk('modal/confirmPromise', async (args, b) => {
//   let { target, message } = args
//   b.dispatch(setMessage('test message'))
//   b.dispatch(setDialogType('Confirmation'))
//   b.dispatch(setVisible(true))
//   const confirmed = await new Promise(function(resolve, reject){
//     callbackDict["resolve"] = resolve;
//   });
//
//   if (confirmed) {
//     target()
//   }
// })


export const modalBuilder = createAsyncThunk('modal/modalBuilder', (args, b) => {
  let {alertKey, targetObj, callbackObj, errorObj} = args

  let modal = b.dispatch(modalDialog({
    "target": () => {targetObj.func(...targetObj.args)},
    "alertKey": alertKey,
  }))
  .then(unwrapResult)
  .then((result) => {callbackObj.func(result, ...callbackObj.args)})
  .catch((error) => {errorObj.func(error, ...errorObj.args)})
})

// export const modalBuilder = createAsyncThunk('modal/modalBuilder', (args, b) => {
//   let {alertKey, targetObj, callbackObj, errorObj} = args
//
//   let modal = b.dispatch(modalDialog({
//     "target": () => {b.dispatch(targetObj.func(...targetObj.args))},
//     "alertKey": alertKey,
//   }))
//   .then(unwrapResult)
//   .then((result) => {callbackObj.func(result, ...callbackObj.args)})
//   .catch((error) => {errorObj.func(error, ...errorObj.args)})
// })

export const confirmationDialog = createAsyncThunk('modal/confirmPromise', async (args, b) => {
  let { target, alertKey, data } = args
  let alert = alertManager.hasAlert(alertKey, data)
  console.log(alert)

  if (alert) {

    b.dispatch(setMessage(alert.text))
    b.dispatch(setDialogType(alert.type))
    b.dispatch(setVisible(true))
    // try {
    const promise = await new Promise(function(resolve, reject){
      callbackDict["resolve"] = resolve;
      callbackDict["reject"] = reject;
    })
    .then((res) => {
      console.log(res)
      target()
    })
    .catch((error) => {
      console.log(error)
    })
  }

  else {
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


export const modalDialog = createAsyncThunk('modal/modalPromise', async (args, b) => {
  let { alertKey, data } = args
  let alert = alertManager.hasAlert(alertKey, data)

  if (alert) {
    b.dispatch(setMessage(alert.text))
    b.dispatch(setDialogType(alert.type))
    b.dispatch(setVisible(true))

    const promise = await new Promise(function(resolve, reject){
      callbackDict["resolve"] = () => {
        console.log("resolving from modal")
        resolve()
      }
      callbackDict["reject"] = () => {
        console.log("rejecting from modal")
        reject()
      }
    })
    console.log("alert processed, returning modal results")
    return promise

  } else {
    console.log("no alert, returning")
    return
  }
})

////original
// export const modalDialog = createAsyncThunk('modal/modalPromise', async (args, b) => {
//   console.log("modal builder dialog")
//   console.log(args)
//   let { target, alertKey, data } = args
//   let alert = alertManager.hasAlert(alertKey, data)
//
//   try {
//   if (alert) {
//     b.dispatch(setMessage(alert.text))
//     b.dispatch(setDialogType(alert.type))
//     b.dispatch(setVisible(true))
//     console.log("1")
//
//     const promise = await new Promise(function(resolve, reject){
//       console.log("2")
//       callbackDict["resolve"] = resolve
//       callbackDict["reject"] = reject
//     })
//     .then(() => {
//       console.log("alert resolved")
//       target()
//       return true
//       // resolve(true)
//     })
//     .catch((error) => {
//       console.log("alert rejected")
//       b.abort()
//       return error
//       // retject(false)
//     });
//     console.log("3")
//     return promise
//
//   } else {
//     console.log("modal slice running target")
//     try {target()}
//     catch (error) {console.log(error)}
//   }
// } catch (error) {
//   console.log("catch")
//   console.log(error)
// }
// console.log("4")
// })

export const alertDialog = createAsyncThunk('modal/alertPromise', async (args, b) => {
  let { target, alertKey, data } = args
  let alert = alertManager.hasAlert(alertKey, data)
  if (alert) {
    b.dispatch(setMessage(alert.text))
    b.dispatch(setDialogType(alert.type))
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
    builder.addCase(confirmationDialog.rejected, (state, action) => {
      state.visible = false
      state.message = ''
      state.dialogType = ''
    })
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
