import React, { useRef, useState, useEffect } from "react";
import { styles } from '../style'
export const SettingsButton = (props) => {
  return (
    <button
      {...props}
      style={props.selected ? {...styles.SettingsButton, ...styles.ButtonDisabled} : styles.SettingsButton}
      >
      {props.children}
      </button>
    )
}

// export default SettingsButton
