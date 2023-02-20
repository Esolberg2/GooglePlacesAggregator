import React, { useRef, useState, useEffect } from "react";
import { BsFillQuestionCircleFill } from 'react-icons/bs';

function IconButton(props) {

  return (
    <div
      style={{ display:'flex', alignItems: 'flex-start', paddingLeft: '7px', paddingTop: '2.5px'}}
    >
      <BsFillQuestionCircleFill onClick={() => alert(props.message)}/>
    </div>)
}

export default IconButton
