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

//  run() {
//   let modal = store.dispatch(modalDialog({
//     "alertKey": this.alertKey,
//     "data": this.data
//   }))
//
//   .then(unwrapResult)
//   .then((result) => {
//     this.callback(result)
//   })
//   .catch((error) => {
//     this.errorback(error)
//   })
// }

run() {
  return new Promise((resolve, reject) => {
    let modal = store.dispatch(modalDialog({
      "alertKey": this.alertKey,
      "data": this.data
    }))
    console.log(modal)
    // console.log(modal.unwrap())
    modal.unwrap()
    .then((unwrapResults) => {
      console.log(unwrapResults)
    })
    .then(async (result) => {
      console.log(result)
      await this.callback()
      resolve()
      // resolve()
    })
    // .then((output) => {
    //   console.log(output)
    //   resolve(output)
    // })
    .catch((error) => {
      this.errorback(error)
      reject(error)
    })
  })

}

}

// export default connect(null, { modalDialog })(ModalBuilder)
