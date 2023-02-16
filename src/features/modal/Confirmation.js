import React, { useEffect, useRef, useState, useCallback } from 'react'

export function ConfirmationModal(props) {
  const {
    confirmCallback,
    rejectCallback,
    message,
    visible,
    title
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
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', paddingBottom: '15px'}}> {title} </div>
      <div style={{ margin: '10px', textAlign: 'center'}}>
        {message}
      </div>
      <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'space-around' }}>
        <button onClick={onConfirm}>confirm</button>
        <button onClick={onDeny}>deny</button>
      </div>
    </div>
  );
}
