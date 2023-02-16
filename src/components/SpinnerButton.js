import React, { useRef, useState, useEffect, useDispatch } from "react";
import { googlePlacesApiManager } from '../googleAPI/googlePlacesApiManager'
import { TailSpin } from  'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { settingsPanelActions } from '../features/settingsPanel/settingsPanelSlice'
import styled from 'styled-components';

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

const SpinnerButton = (props) => {

  const {
    text,
    textStyle,
    buttonStyle,
    spinnerStyle,
    height,
    width,
    children,
    func,
    funcArgs,
    loading,
    onClick
  } = props

  const [inputUpdated, setInputUpdated] = useState(false)

  return (
    <div style={{}}>
      <Button
        key={props.buttonKey}
        onClick={onClick}
        style={{...{padding: '5px', margin: '5px', whiteSpace: 'nowrap'}, ...buttonStyle}}
        disabled={props.disabled}
        >
        <div key={props.textKey} style={{...{width: width, height: loading ? '0px' : height, visibility: loading ? 'hidden' : 'visible'}, ...textStyle}}>
        {children}
        </div>
        <TailSpin
          height={height}
          width={width}
          color='grey'
          ariaLabel='loading'
          visible={loading ? true : false}
          style={spinnerStyle}
          />
      </Button>
    </div>)
}

export default SpinnerButton
