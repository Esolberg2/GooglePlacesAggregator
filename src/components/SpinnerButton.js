import React, { useRef, useState, useEffect } from "react";
import {updateGoogleApi} from "../helperFunctions/google_JS_API_Helpers"
import { TailSpin } from  'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

const SpinnerButton = (props) => {
  const [spinner, setSpinner] = useState(false);
  const [loading, setLoading] = useState(false);
  const prevLoading = usePrevious(loading);

  const text = props.text
  const textStyle = props.textStyle
  const buttonStyle = props.buttonStyle
  const spinnerStyle = props.spinnerStyle
  const height = props.height
  const width = props.width
  const children = props.children

  const func = props.func
  const funcArgs = props.funcArgs


  function funcWrapper(func) {
    return async function(...args) {
      if (spinner) {
        let res = await func.call(this, ...args)
        setLoading(false)
      }
    }
  }


  useEffect(() => {

    const wrappedFunction = funcWrapper(func)

    wrappedFunction(...funcArgs)

  }, [spinner])


  useEffect(() => {
    if (loading && !prevLoading) {
      setSpinner(true)
    } else {
      setSpinner(false)
    }
  }, [loading])


  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  }

  return (
    <div>
      <button
        onClick={() => setLoading(true)}
        style={{...{padding: '5px', margin: '5px', whiteSpace: 'nowrap'}, ...buttonStyle}}
        >
        <div style={{...{width: width, height: loading ? '0px' : height, visibility: loading ? 'hidden' : 'visible'}, ...textStyle}}>
        {children}
        </div>
        <TailSpin
          height={height}
          width={width}
          color='grey'
          ariaLabel='loading'
          visible={loading ? true : false}
          style={spinnerStyle}
          />
      </button>
    </div>)
}

export default SpinnerButton



// function timeout(ms) {
//   return new Promise((resovle) => {
//     setTimeout(resovle, ms);
//   })
// }
//
// useEffect(() => {
//   async function funcWrap() {
//     if (spinner) {
//       let res = await func(...funcArgs)
//       setLoading(false)
//     }
//   }
//   // const wrappedFunction = funcWrapper(func)
//
//   funcWrap(...funcArgs)
//
// }, [spinner])
