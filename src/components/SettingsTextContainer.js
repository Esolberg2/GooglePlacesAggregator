import React, { useRef, useState, useEffect } from "react";
import { IoInformationCircleOutline } from 'react-icons/io5';
import { InfoPopup } from './InfoPopup'
import { styles } from '../style'

export const SettingsTextContainer = (props) => {

  const [visible, setVisible] = useState(false)

  return (
    <div style={{...props.style, ...styles.SettingsTextContainer}}>
      <div style={{fontWeight: 'bold', color: '#36B569', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
      {props.title}
      <IoInformationCircleOutline style={{ paddingLeft: '2.5px'}} onClick={() => setVisible(!visible)}/>
      </div>
      <InfoPopup
        message={props.description}
        visible={visible}
        setVisible={setVisible}
        title={props.popupTitle}
      />
      <div style={{ flexGrow: '1'}}/>
      <div style={{ display: 'flex', justifyContent: 'center'}}>
      {props.children}
      </div>
    </div>
    )
}
