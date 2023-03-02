import React from 'react';
import PropTypes from 'prop-types';

function ConfirmationModal(props) {
  const {
    confirmCallback,
    rejectCallback,
    message,
    title,
    image,
  } = props;

  function onConfirm() {
    confirmCallback();
    return true;
  }

  function onDeny() {
    rejectCallback();
    return false;
  }

  function renderImage() {
    if (image) {
      return (
        <img
          width="100%"
          height="50%"
          src={require(`../../assets/images/${image}`)}
        />
      );
    }
    return null;
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
      {renderImage()}
      <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'space-around' }}>
        <button type="button" onClick={onConfirm}>continue</button>
        <button type="button" onClick={onDeny}>cancel</button>
      </div>
    </div>
  );
}

ConfirmationModal.propTypes = {
  confirmCallback: PropTypes.func.isRequired,
  rejectCallback: PropTypes.func.isRequired,
  message: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  image: PropTypes.string,
};

ConfirmationModal.defaultProps = {
  image: null,
};

export default ConfirmationModal;
