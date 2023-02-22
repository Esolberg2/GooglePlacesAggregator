import React from 'react';
import { TailSpin } from 'react-loader-spinner';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Button = styled.button`
  background-color: #36B569;
  font-size: 12px;
  font-weight: bold;
  border-radius: 20px;
  border-width: 0px;
  padding: 5px;
  margin: 5px;
  width: 65px;
  color: white;
  &:active {
    opacity: 0.5;
  }
  &:disabled {
    background-color: #ccc;
  }
`;

function SpinnerButton(props) {
  const {
    textStyle,
    buttonStyle,
    spinnerStyle,
    height,
    width,
    children,
    loading,
    onClick,
  } = props;

  return (
    <div>
      <Button
        key={props.buttonKey}
        onClick={onClick}
        style={{
          ...{ padding: '5px', margin: '5px', whiteSpace: 'nowrap' },
          ...buttonStyle,
        }}
        disabled={props.disabled}
      >
        <div
          key={props.textKey}
          style={{
            ...{ width: width, height: loading ? '0px' : height, visibility: loading ? 'hidden' : 'visible' },
            ...textStyle,
          }}
        >
          {children}
        </div>
        <TailSpin
          height={height}
          width={width}
          color="grey"
          ariaLabel="loading"
          visible={loading}
          style={spinnerStyle}
        />
      </Button>
    </div>
  );
}

SpinnerButton.propTypes = {
  children: PropTypes.node.isRequired,
  textStyle: PropTypes.object,
  buttonStyle: PropTypes.object,
  spinnerStyle: PropTypes.object,
  height: PropTypes.string,
  width: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

SpinnerButton.defaultProps = {
  textStyle: {},
  buttonStyle: {},
  spinnerStyle: {},
  height: '15px',
  width: '55px',
};

export default SpinnerButton;
