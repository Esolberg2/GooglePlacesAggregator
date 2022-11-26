


import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { searchActions } from '../features/search/searchSlice'

export const FilePicker = (props) => {
  const inputRef = useRef();

  const dispatch = useDispatch()
  const fileData = useSelector((state) => state.search.fileData)
  const fileName = useSelector((state) => state.search.fileName)


  function loadFile(value) {
    let fileReader;

    const handleFileRead = (e) => {
      const content = fileReader.result;
      // setFileData(content)
      dispatch(searchActions.setFileData(content))
      // dataFile.current = content
    }

    const handleFileChosen = (file) => {
      // set state for filename
      // setFileNameText(file["name"])
      dispatch(searchActions.setFileName(file["name"]))
      fileReader = new FileReader();
      fileReader.onloadend = handleFileRead;
      if (file) {
        fileReader.readAsText(file);
      }
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
        value={props.filename}
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
