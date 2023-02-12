import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setVisible, callbackDict } from './modalSlice'
import { AlertModal } from './Alert'
import { ConfirmationModal } from './Confirmation'
import Modal from 'react-modal';
Modal.setAppElement('body')

// export const DialogModal = React.memo(props => {
export function DialogModal() {

  const dialogType = useSelector((state) => state.modal.dialogType)

  if (dialogType == "Alert") {
    return <AlertModal />
  }
  if (dialogType == "Confirmation") {
    return <ConfirmationModal />
  } else {
    return null
  }
}
