import React, { useRef, useState } from "react";


const FilePicker = React.forwardRef((props, ref) => {
  const inputRef = useRef();
  let fileReader;

  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <button
      onClick={() => inputRef.current.click()}
      style={{padding: '5px', margin: '5px', width: '150px'}}
      >
        Select File
      </button>
      <input
        ref={inputRef}

        onChange={e => props.onChange(e)}
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
})

export default FilePicker
