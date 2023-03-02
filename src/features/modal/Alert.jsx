import React from 'react';
import PropTypes from 'prop-types';

function AlertModal(props) {
  const {
    rejectCallback,
    message,
    title,
    image,
  } = props;

  function onDeny() {
    rejectCallback();
    return false;
  }

  function renderImage() {
    if (image) {
      return (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
          width="100%"
          height="50%"
          // eslint-disable-next-line import/no-dynamic-require, global-require
          src={require(`../../assets/images/${image}`)}
        />
      );
    }
    return null;
  }

  return (
    <div>
      <div
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center',
          paddingBottom: '15px',
        }}
      >
        {title}
      </div>
      <div
        style={{
          margin: '10px',
          textAlign: 'center',
        }}
      >
        {message}
      </div>
      {renderImage()}
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
  image: PropTypes.string,
};

AlertModal.defaultProps = {
  image: null,
};

export default AlertModal;
