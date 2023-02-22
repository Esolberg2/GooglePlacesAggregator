import React from 'react';
import PropTypes from 'prop-types';

function ConfirmationModal(props) {
  const {
    confirmCallback,
    rejectCallback,
    message,
    title,
  } = props;

  function onConfirm() {
    confirmCallback();
    return true;
  }

  function onDeny() {
    rejectCallback();
    return false;
  }

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontSize: '16px', fontWeight: 'bold', textAlign: 'center', paddingBottom: '15px',
        }}
      >
        {title}
      </div>
      <div
        style={{
          margin: '10px', textAlign: 'center',
        }}
      >
        {message}
      </div>
      <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'space-around' }}>
        <button type="button" onClick={onConfirm}>confirm</button>
        <button type="button" onClick={onDeny}>deny</button>
      </div>
    </div>
  );
}

ConfirmationModal.propTypes = {
  confirmCallback: PropTypes.func.isRequired,
  rejectCallback: PropTypes.func.isRequired,
  message: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
};

export default ConfirmationModal;
