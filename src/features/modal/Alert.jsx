import React from 'react';
import PropTypes from 'prop-types';

function AlertModal(props) {
  const {
    rejectCallback,
    message,
    title,
  } = props;

  function onDeny() {
    rejectCallback();
    return false;
  }

  return (
    <div>
      <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', paddingBottom: '15px'}}> {title} </div>
      <div
        style={{
          margin: '10px',
          textAlign: 'center',
        }}
      >
        {message}
      </div>
      <div style={{ paddingTop: '10px', display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={onDeny}
        >
          ok
        </button>
      </div>
    </div>
  );
}

AlertModal.propTypes = {
  rejectCallback: PropTypes.func.isRequired,
  message: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
};

export default AlertModal;
