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
    width: '25%',
    marginRight: '-50%',
    borderRadius: '10px',
    // backgroundColor: '#3CCD65',
    backgroundColor: '#F8F8F8',
    fontWeight: '300',
    fontSize: '13px',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)'
  },
  overlay: {
    zIndex: 9999,
  }
};

// const customStyles = {
//   content: {
//     top: '50%',
//     left: '50%',
//     right: 'auto',
//     bottom: 'auto',
//     marginRight: '-50%',
//     transform: 'translate(-50%, -50%)',
//   },
//   overlay: {
//     zIndex: 9999,
//   }
// };

export const DynamicModal = React.memo(props => {
// export function DynamicModal(props) {
  const {
    rejectCallback,
    confirmCallback,
    title,
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
          title={title}
        />
      )
    }
    if (type == "Confirmation") {
      return (
        <ConfirmationModal
          confirmCallback={confirmCallback}
          rejectCallback={rejectCallback}
          message={message}
          title={title}
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
