import React from 'react'
import { connect } from 'react-redux'
import { useDispatch } from 'react-redux'
import { modalDialog, modalBuilder } from '../modal/modalSlice'
import { unwrapResult } from '@reduxjs/toolkit'
import store from '../../store'

export class ModalBuilder {

  constructor(alertKey = null, data = null, callback = null, errorback = null) {

    this.data = data

    this.alertKey = alertKey

    this.callback = callback ? callback : () => {
      throw new Error('A callback must be provided to class ModalBuilder(alertKey, data, callback, errorback)')
    }

    this.errorback = errorback ? errorback : () => {
      throw new Error('A errorback must be provided to class ModalBuilder(alertKey, data, callback, errorback)')
    }
  }

 run() {
  console.log("modalBuilder run")
  let modal = store.dispatch(modalDialog({
    "alertKey": this.alertKey,
    "data": this.data
  }))

  .then(unwrapResult)
  .then((result) => {
    console.log("running unwrapped")
    this.callback(result)
  })
  .catch((error) => {
    console.log("error unwrapped")
    console.log(error)
    this.errorback(error)
  })
}
}

// export default connect(null, { modalDialog })(ModalBuilder)
