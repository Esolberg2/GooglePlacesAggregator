import styled from 'styled-components';
import React from 'react';
import PropTypes from 'prop-types';

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

function SearchInterfaceButton(props) {
  const { children } = props;
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Button {...props}>
      {children}
    </Button>
  );
}

SearchInterfaceButton.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SearchInterfaceButton;
