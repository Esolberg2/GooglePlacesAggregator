import React, { useRef, useState, useEffect } from "react";
import { styles } from '../style'
import styled from 'styled-components';


const Button = styled.button`
  background-color: #36B569;
  font-size: 14px;
  font-weight: bold;
  border-radius: 20px;
  border-width: 0px;
  padding: 5px;
  margin: 5px;
  width: 150px;
  color: white;
  &:active {
    opacity: 0.5;
  }
  &:disabled {
    background-color: #ccc;
  }
`;


export const SearchInterfaceButton = (props) => {
  return (
    <Button {...props}>
      {props.children}
    </Button>
    )
}
