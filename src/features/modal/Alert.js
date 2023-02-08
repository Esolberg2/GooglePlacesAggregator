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
  overlay: {
    zIndex: 9999,
  }
};


export const AlertModal = React.memo(props => {
  console.log("alert module triggered")
  const visible = useSelector((state) => state.modal.visible)
  const message = useSelector((state) => state.modal.message)
  const callback = callbackDict.reject
  console.log(callback)

  function onConfirm() {
    console.log("rejected")
    callback(false)

  }

  return (
    <div>
      <Modal
        isOpen={visible}
        style={customStyles}
        contentLabel="Alert Modal"
      >
        <button onClick={() => {
          console.log("clicked")
          console.log(callback)
          onConfirm()
        }}>ok</button>
        <div>{message}</div>
      </Modal>
    </div>
  );
})
