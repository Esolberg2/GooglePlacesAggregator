import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { modalFunctionStore, setVisible, callbackDict } from './modalSlice'

export function AlertModal(props) {
  const {
    rejectCallback,
    message,
    visible,
    title
  } = props

  function onDeny() {
    console.log(props)
    rejectCallback()
    return false
  }

  // <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center'}}> {title} </div>
  // <div style={{ margin: '30px', textAlign: 'left'}}>
  //   {message}
  // </div>

  return (
    <div>
      <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', paddingBottom: '15px'}}> {title} </div>
      <div style={{ margin: '10px', textAlign: 'center'}}>
        {message}
      </div>
      <div style={{ paddingTop: '10px', display: 'flex', justifyContent: 'center' }}>
        <button onClick={onDeny}>ok</button>
      </div>
    </div>
  );
}
