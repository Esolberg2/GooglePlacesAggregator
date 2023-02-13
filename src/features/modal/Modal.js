import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setVisible, callbackDict } from './modalSlice'
import { AlertModal } from './Alert'
import { ConfirmationModal } from './Confirmation'
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

export const DynamicModal = React.memo(props => {
// export function DynamicModal(props) {
  const {
    rejectCallback,
    confirmCallback,
    message,
    visible
  } = props

  const type = useSelector((state) => state.modal.dialogType)
  
  function renderModal() {
    if (type == "Alert") {
      return (
        <AlertModal
          rejectCallback={rejectCallback}
          message={message}
        />
      )
    }
    if (type == "Confirmation") {
      return (
        <ConfirmationModal
          confirmCallback={confirmCallback}
          rejectCallback={rejectCallback}
          message={message}
        />
      )
    } else {
      return null
    }
  }

  return (
    <Modal
      isOpen={visible}
      style={customStyles}
    >
      {renderModal()}
    </Modal>
  )
})
