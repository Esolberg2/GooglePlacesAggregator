import React, { useRef } from "react";
import { IoInformationCircleOutline } from 'react-icons/io5';
import { InfoPopup } from './InfoPopup'
import { styles } from '../style'

function SettingsTextContainer(props) {

  const infoRef = useRef()

  return (
    <div style={{...props.style, ...styles.SettingsTextContainer}}>
      <div
        style={{fontWeight: 'bold', color: '#36B569', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
        {props.title}
        <IoInformationCircleOutline
          style={{ paddingLeft: '2.5px'}}
          onClick={() => {
            infoRef.current.toggleVisible()
          }}
        />
      </div>
      <InfoPopup
        ref={infoRef}
        message={props.description}
        title={props.popupTitle}
      />
      <div style={{ flexGrow: '1'}}/>
      <div style={{ display: 'flex', justifyContent: 'center'}}>
        {props.children}
      </div>
    </div>
  )
}

export default SettingsTextContainer
