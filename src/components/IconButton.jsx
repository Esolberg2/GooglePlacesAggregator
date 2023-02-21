import React from 'react';
import PropTypes from 'prop-types';
import { BsFillQuestionCircleFill } from 'react-icons/bs';

function IconButton({ message }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        paddingLeft: '7px',
        paddingTop: '2.5px',
      }}
    >
      <BsFillQuestionCircleFill onClick={() => alert(message)} />
    </div>
  );
}

IconButton.propTypes = {
  message: PropTypes.string.isRequired,
};

export default IconButton;
