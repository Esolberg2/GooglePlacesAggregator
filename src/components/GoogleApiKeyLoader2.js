import React, { useRef, useState, useEffect } from "react";
import SpinnerButton from './components/SpinnerButton.js'
import {updateGoogleApi} from "../helperFunctions/google_JS_API_Helpers"
import { TailSpin } from  'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";

const GoogleApiKeyLoader = (props) => {
  const [spinner, setSpinner] = useState(false);
  const [loading, setLoading] = useState(false);
  const prevLoading = usePrevious(loading);

  let apiKey = props.apiKey

  useEffect(() => {
    async function updateGoogleApiWrap() {
      if (spinner) {
        let res = await updateGoogleApi(apiKey)
        setLoading(false)
      }
    }
    updateGoogleApiWrap()
  }, [spinner])


  useEffect(() => {
    if (loading && !prevLoading) {
      setSpinner(true)
    } else {
      setSpinner(false)
    }
  }, [loading])


  function usePrevious(value) {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef();
    // Store current value in ref
    useEffect(() => {
      ref.current = value;
    }, [value]); // Only re-run if value changes
    // Return previous value (happens before update in useEffect above)
    return ref.current;
  }

  return (
    <div>
      <button
        onClick={() => setLoading(true)}
        style={{padding: '5px', margin: '5px', whiteSpace: 'nowrap'}}
        >
        <div style={{width:"47px", height: loading ? '0px' : '15px', visibility: loading ? 'hidden' : 'visible'}}>
        Set Key
        </div>
        <TailSpin
          height="15px"
          width="47px"
          color='grey'
          ariaLabel='loading'
          visible={loading ? true : false}
          />
      </button>
    </div>)
}

export default GoogleApiKeyLoader
