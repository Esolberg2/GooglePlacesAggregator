import React, { useRef, useState, useEffect } from "react";
import { styles } from '../style'

export const SettingsTextContainer = (props) => {
  return (
    <div style={{...props.style, ...styles.SettingsTextContainer}}>
      <div style={{fontWeight: 'bold', color: '#36B569'}}>
      {props.title}
      </div>
      <div style={styles.SettingsDescription}>
        {props.description}
      </div>
      <div style={{ flexGrow: '1'}}/>
      {props.children}
    </div>
    )
}
