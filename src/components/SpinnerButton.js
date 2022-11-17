import React, { useRef, useState, useEffect } from "react";
import { googlePlacesApiManager } from '../googleAPI/googlePlacesApiManager'
import { TailSpin } from  'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

const SpinnerButton = (props) => {
  const [spinner, setSpinner] = useState(false);
  const [loading, setLoading] = useState(false);
  // const prevLoading = usePrevious(loading);

  const text = props.text
  const textStyle = props.textStyle
  const buttonStyle = props.buttonStyle
  const spinnerStyle = props.spinnerStyle
  const height = props.height
  const width = props.width
  const children = props.children

  const func = props.func
  const funcArgs = props.funcArgs

  const [inputUpdated, setInputUpdated] = useState(false)

  // function funcWrapper(func) {
  //   return async function(...args) {
  //     if (spinner) {
  //       let res = await func.call(this, ...args)
  //       setLoading(false)
  //     }
  //   }
  // }

  // function onClickWrapper() {
  //   props.onClick()
  //   setLoading(true)
  // }

  // useEffect(() => {
  //   const wrappedFunction = funcWrapper(func)
  //   wrappedFunction(...funcArgs)
  //   if (!spinner) {
  //     props.onClick()
  //   }
  // }, [spinner])
  //
  //
  // useEffect(() => {
  //   if (loading && !prevLoading) {
  //     setSpinner(true)
  //   } else {
  //     setSpinner(false)
  //     // props.onClick()
  //   }
  // }, [loading])
  //
  //
  // function usePrevious(value) {
  //   const ref = useRef();
  //   useEffect(() => {
  //     ref.current = value;
  //   }, [value]);
  //   return ref.current;
  // }

  return (
    <div style={{}}>
      <button
        key={props.buttonKey}
        onClick={() => {
          // setLoading(true)
          googlePlacesApiManager.updateGoogleApi(funcArgs[0]).then((res) => {
            console.log("done loading")
          })
        }}
        style={{...{padding: '5px', margin: '5px', whiteSpace: 'nowrap'}, ...buttonStyle}}
        disabled={props.disabled}
        >
        <div key={props.textKey} style={{...{width: width, height: loading ? '0px' : height, visibility: loading ? 'hidden' : 'visible'}, ...textStyle}}>
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
