import React, { useState, useImperativeHandle } from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';

Modal.setAppElement('body');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    width: '25%',
    marginRight: '-50%',
    borderRadius: '10px',
    backgroundColor: '#F8F8F8',
    fontWeight: '300',
    fontSize: '13px',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    zIndex: 9999,
  },
};

const InfoPopup = React.memo(React.forwardRef((props, ref) => {
  const {
    message,
    title,
  } = props;

  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    toggleVisible: () => {
      setVisible(!visible);
    },
  }));

  return (
    <Modal
      isOpen={visible}
      style={customStyles}
      onRequestClose={() => setVisible(false)}
      shouldCloseOnOverlayClick
    >
      <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>
        {title}
      </div>
      <div style={{ margin: '30px', textAlign: 'left' }}>
        {message}
      </div>
    </Modal>
  );
}));

InfoPopup.propTypes = {
  message: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
};

export default InfoPopup;
