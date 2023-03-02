import React from 'react';
import Modal from 'react-modal';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import AlertModal from './Alert';
import ConfirmationModal from './Confirmation';

Modal.setAppElement('body');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    width: '35%',
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

const DynamicModal = React.memo((props) => {
  const {
    rejectCallback,
    confirmCallback,
    title,
    message,
    visible,
    image,
  } = props;

  const type = useSelector((state) => state.modal.dialogType);

  function renderModal() {
    if (type === 'Alert') {
      return (
        <AlertModal
          rejectCallback={rejectCallback}
          message={message}
          title={title}
          image={image}
        />
      );
    }
    if (type === 'Confirmation') {
      return (
        <ConfirmationModal
          confirmCallback={confirmCallback}
          rejectCallback={rejectCallback}
          message={message}
          title={title}
          image={image}
        />
      );
    }
    return null;
  }

  return (
    <Modal
      isOpen={visible}
      style={customStyles}
    >
      {renderModal()}
    </Modal>
  );
});

DynamicModal.propTypes = {
  rejectCallback: PropTypes.func,
  confirmCallback: PropTypes.func,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
  image: PropTypes.string,
};

DynamicModal.defaultProps = {
  rejectCallback: () => {},
  confirmCallback: () => {},
  image: undefined,
};

export default DynamicModal;
