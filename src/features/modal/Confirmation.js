import React, { useEffect, useRef, useState, useCallback } from 'react'

export function ConfirmationModal(props) {
  const {
    confirmCallback,
    rejectCallback,
    message,
    visible
  } = props

  function onConfirm() {
    confirmCallback()
    return true
  }

  function onDeny() {
    rejectCallback()
    return false
  }

  return (
    <div>
      <div>{message}</div>
      <button onClick={onConfirm}>confirm</button>
      <button onClick={onDeny}>deny</button>
    </div>
  );
}
