import React from 'react'
import { connect } from 'react-redux'
import { useDispatch } from 'react-redux'
import { modalDialog, modalBuilder } from '../modal/modalSlice'
import { unwrapResult } from '@reduxjs/toolkit'
import store from '../../store'

export class ModalBuilder {

  constructor(alertKey = null, data = null, callback = null, errorback = null) {

    this.resolve = undefined
    this.reject = undefined
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })

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

// run() {
//   return new Promise((resolve, reject) => {
//     let modal = store.dispatch(modalDialog({
//       "alertKey": this.alertKey,
//       "data": this.data
//     }))
//     modal.unwrap()
//     .then(async (result) => {
//       await this.callback()
//       resolve()
//     })
//     .catch((error) => {
//       this.errorback(error)
//       reject(error)
//     })
//   })
// }


// wherever run() is called, run will be either the
// function associated with "confirm" or "deny"
// based on the user selection.
run() {
    let modal = store.dispatch(modalDialog({
      "alertKey": this.alertKey,
      "data": this.data
    }))

    console.log(modal)
    // modal.unwrap()
    // .then((result) => {
    //   console.log(result)
    //   console.log(this.callback())
    //   // return this.callback()
    // })
    // .catch((error) => {
    //   return this.errorback(error)
    // })
  }

}

// export default connect(null, { modalDialog })(ModalBuilder)
