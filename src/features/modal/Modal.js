import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setVisible } from './modalSlice'
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


// used for dialogs with no user options
function AlertModal(props) {
  const { closeCallback } = props
  const  visible = useSelector((state) => state.modal.visible)
  const dispatch = useDispatch()

  let subtitle;


  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    // subtitle.style.color = '#f00';
  }

  function onAfterClose() {
    console.log("closed")
    closeCallback()
  /* Function that will be run after the modal has closed. */
  }

  function closeModal() {
    dispatch(setVisible(false));
  }

  return (
    <div>
      <button onClick={() => {dispatch(setVisible(true))}}>Open Modal</button>
      <Modal
        isOpen={visible}
        onAfterOpen={afterOpenModal}
        onAfterClose={onAfterClose}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2>
        <button onClick={closeModal}>close</button>
        <div>alert modal</div>
        <form>
          <input />
          <button>tab navigation</button>
          <button>stays</button>
          <button>inside</button>
          <button>the modal</button>
        </form>
      </Modal>
    </div>
  );
}


function WarningModal(props) {
  const { closeCallback } = props
  const  visible = useSelector((state) => state.modal.visible)
  const dispatch = useDispatch()

  let subtitle;


  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    // subtitle.style.color = '#f00';
  }

  function onAfterClose() {
    console.log("closed")
    closeCallback()
  /* Function that will be run after the modal has closed. */
  }

  function closeModal() {
    dispatch(setVisible(false));
  }

  function confirm() {
    closeModal()
    return true
  }

  function deny() {
    closeModal()
    return false
  }

  return (
    <div>
      <button onClick={() => {dispatch(setVisible(true))}}>Open Modal</button>
      <Modal
        isOpen={visible}
        onAfterOpen={afterOpenModal}
        onAfterClose={onAfterClose}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2>
        <button onClick={confirm}>confirm</button>
        <button onClick={deny}>deny</button>
        <div>I am a warning modal</div>
      </Modal>
    </div>
  );
}

export function DialogModal(props) {
  const { type, closeCallback } = props
  if (type == "Alert") {
    return (
      <AlertModal closeCallback={() => {console.log("closed")}} />
    )
  }

  if (type == "Warning") {
    return (<WarningModal closeCallback={() => {console.log("closed")}}/>)
  }
  }
