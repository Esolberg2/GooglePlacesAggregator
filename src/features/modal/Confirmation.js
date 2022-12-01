import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setVisible, callbackDict } from './modalSlice'
import Modal from 'react-modal';
Modal.setAppElement('body')

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

export const ConfirmationModal = React.memo(props => {
  const visible = useSelector((state) => state.modal.visible)
  const resolveCallback = callbackDict.resolve
  const rejectCallback = callbackDict.reject
  const message = useSelector((state) => state.modal.message)


  function onConfirm() {
    console.log("confirming")
    resolveCallback(true)
    return true
  }

  function onDeny() {
    console.log("rejecting")
    rejectCallback(false)
    return false
  }

  return (
    <div>
      <Modal
        isOpen={visible}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <button onClick={onConfirm}>confirm</button>
        <button onClick={onDeny}>deny</button>
        <div>{message}</div>
      </Modal>
    </div>
  );
})
