import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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

export const DynamicModal = (props) => {
  // // const dispatch = useDispatch();
  // const [visible, setVisible] = useState(false);
  // const [error, setError] = useState(false);
  // const [message, setMessage] = useState(false);
  // const [callback, setCallback] = useState(undefined);
  // const [type, setType] = useState(undefined);

  const {
    visible,
    error,
    message,
    callback,
    type,
  } = props;

  function onConfirm() {
    console.log("rejected")
    callback(false)
  }

  function onDeny() {
    console.log("rejecting")
    // rejectCallback(false)
    return false
  }

  function renderAlert() {
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
  }

  function renderConfirmation() {
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
  }

  return <div />
}
