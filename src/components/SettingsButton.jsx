import React from 'react';
import PropTypes from 'prop-types';
import { styles } from '../style';

function SettingsButton(props) {
  const { children, selected } = props;
  return (
    <button
      type="button"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      style={
        selected ? {
          ...styles.SettingsButton,
          ...styles.ButtonSelected,
        } : styles.SettingsButton
      }
    >
      {children}
    </button>
  );
}

SettingsButton.propTypes = {
  children: PropTypes.node.isRequired,
  selected: PropTypes.bool,
};

SettingsButton.defaultProps = {
  selected: false,
};

export default SettingsButton;
