import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { modalFunctionStore, setVisible, callbackDict } from './modalSlice'

export function AlertModal(props) {
  const {
    rejectCallback,
    message,
    visible
  } = props

  function onDeny() {
    console.log(props)
    rejectCallback()
    return false
  }

  return (
    <div>
      <div>{message}</div>
      <button onClick={onDeny}>ok</button>
    </div>
  );
}
