import React, { useEffect, useRef, useState, useCallback } from 'react'
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

export const InfoPopup = React.memo(props => {

  const {
    message,
    visible,
    setVisible,
    title
  } = props


  return (
    <Modal
      isOpen={visible}
      style={customStyles}
      onRequestClose={() => setVisible(false)}
      shouldCloseOnOverlayClick={true}
    >
      <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center'}}> {title} </div>
      <div style={{ margin: '30px', textAlign: 'left'}}>
        {message}
      </div>
    </Modal>
  )
})
