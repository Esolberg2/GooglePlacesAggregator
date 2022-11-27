


import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setFileData,
  setFileName
} from '../features/loadFile/loadFileSlice'
import { alertManager } from '../alerts/alertManager'
import { alertDialog } from '../features/modal/modalSlice'

// let searchActions;
// let alertManager;
// let alertDialog;

export const FilePicker = (props) => {
  const inputRef = useRef();

  const dispatch = useDispatch()
  const fileData = useSelector((state) => state.search.fileData)
  const fileName = useSelector((state) => state.search.fileName)


  function loadFile(value) {
    let fileReader;

    const handleFileChosen = (file) => {
      dispatch(setFileData({}))
      dispatch(setFileName(''))

      fileReader = new FileReader();
      fileReader.onloadend = (e) => {handleFileRead(e, file)};
      if (file) {
        fileReader.readAsText(file);
      }

      inputRef.current.value = null
      // console.log(inputRef)
    }

    const handleFileRead = async (e, file) => {
      const content = fileReader.result;

      let alert = await dispatch(alertDialog({
        "target": () => {
          // console.log(JSON.parse(content))
          dispatch(setFileData(JSON.parse(content)))
          dispatch(setFileName(file["name"]))
        },
        "alertKey": "selectFile",
        "data": {"dataFile": content}
      }))

      console.log("alert return")
      console.log(alert)
      // if (alert.payload == true) {
      //   dispatch(searchActions.setFileData({}))
      //   dispatch(searchActions.setFileName(''))
      // }
    }

    handleFileChosen(value.target.files[0])
  }

  let fileReader;
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <button
      onClick={() => inputRef.current.click()}
      style={{padding: '5px', margin: '5px', width: '150px'}}
      disabled={props.disabled}
      >
        Select File
      </button>

      <input
        ref={inputRef}

        onChange={e => loadFile(e)}
        multiple={false}
        type="file"
        accept='.json'
        hidden
      />
      <input
        type="text"
        value={fileName}
        readOnly={true}
        style={{ padding: '5px', margin: '5px', textAlign: 'center', backgroundColor: '#cccccc'}}
        placeholder="Prior Data File"
        />
    </div>
  );
}




// import React, { useRef, useState } from "react";


// const FilePicker = React.forwardRef((props, ref) => {
//   const inputRef = useRef();
//   let fileReader;
//   return (
//     <div style={{display: 'flex', flexDirection: 'column'}}>
//       <button
//       onClick={() => inputRef.current.click()}
//       style={{padding: '5px', margin: '5px', width: '150px'}}
//       disabled={props.disabled}
//       >
//         Select File
//       </button>
//       <input
//         ref={inputRef}
//
//         onChange={e => props.onChange(e)}
//         multiple={false}
//         type="file"
//         accept='.json'
//         hidden
//       />
//       <input
//         type="text"
//         value={props.filename}
//         readOnly={true}
//         style={{ padding: '5px', margin: '5px', textAlign: 'center', backgroundColor: '#cccccc'}}
//         placeholder="Prior Data File"
//         />
//     </div>
//   );
// })
