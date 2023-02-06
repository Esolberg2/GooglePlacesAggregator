import React, { useRef, useState, useEffect } from "react";
import { styles } from '../style'
export const SearchInterfaceButton = (props) => {
  console.log(props.children)
  return (
    <button
      {...props}
      style={styles.SearchInterfaceButton}
      >
      <div style={{fontSize: 14, color: 'white', fontWeight: 'bold'}}>{props.children}</div>
      </button>
    )
}
