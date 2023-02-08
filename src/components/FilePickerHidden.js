


import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  setFileData,
  setFileName
} from '../features/loadFile/loadFileSlice'
import { alertManager } from '../alerts/alertManager'
import { alertDialog } from '../features/modal/modalSlice'
import { ModalBuilder } from '../features/modal/ModalBuilder'

// let searchActions;
// let alertManager;
// let alertDialog;

export const FilePickerHidden = (props) => {
  const inputRef = useRef();

  const dispatch = useDispatch()
  const fileData = useSelector((state) => state.loadFile.fileData)
  const fileName = useSelector((state) => state.loadFile.fileName)


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
    }

    const handleFileRead = async (e, file) => {
      const content = fileReader.result;

      let modalBuilder = new ModalBuilder()
      modalBuilder.alertKey = 'selectFile'
      modalBuilder.callback = () => {
        console.log("accepted")
        dispatch(setFileData(JSON.parse(content)))
        dispatch(setFileName(file["name"]))
      }
      modalBuilder.errorback = (error) => {
          console.log("reject callback run")
          console.log(error)
        }
      modalBuilder.data = {"dataFile": content}
      modalBuilder.run()
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
    </div>
  );
}
