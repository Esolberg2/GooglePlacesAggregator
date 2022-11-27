import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { mapActions } from './mapSlice'

export function SettingsPanel() {
  return (
    <div style={{padding: '20px'}}>
      <button
        onClick={() => {
          if (!newSearch) {
            selectNewSearch(true)
          }}}
        style={{width: '150px', padding: '5px', margin: '5px', backgroundColor: newSearch ? '#cccccc' : undefined }}
        >
        New Search
        </button>

      <button
        onClick={() => {
          if (newSearch) {
            selectNewSearch(false)
          }}}
        style={{width: '150px', padding: '5px', margin: '5px', backgroundColor: newSearch ? undefined : '#cccccc'}}
        >
        Load Prior Search
        </button>

      <button
        onClick={(e) => exportToJson(e)}
        style={{width: '150px', padding: '5px', margin: '5px'}}
        >
        Download Data
        </button>

      <button
        onClick={(e) => existingDataWarning(e)}
        style={{width: '150px', padding: '5px', margin: '5px'}}
        >
        Clear Search
        </button>

        <button
          onClick={(e) => dispatch(setPolygons(getPolygons()))}
          style={{width: '150px', padding: '5px', margin: '5px'}}
          >
          getPolygons
          </button>

          <button
            onClick={(e) => dispatch(initializeSearchSlice())}
            style={{width: '150px', padding: '5px', margin: '5px'}}
            >
            initialize search
            </button>

            <button
              onClick={() => {
                console.log("new features")
                console.log(sliceSearchedAreas)
                console.log("old features")
                console.log(searchedAreas)
              }
            }
              style={{width: '150px', padding: '5px', margin: '5px'}}
              >
              log features
              </button>

            <button
              onClick={() => {
                console.log("updateGoogleApi")
                googlePlacesApiManager.updateGoogleApi('AIzaSyBhJRgpD2FTMa8_q68645LQRb2qNVD6wlE')
              }
            }
              style={{width: '150px', padding: '5px', margin: '5px'}}
              >
              load google service
              </button>

            <button
              onClick={() => {
                googlePlacesApiManager.removeGoogle()
              }
            }
              style={{width: '150px', padding: '5px', margin: '5px'}}
              >
              remove google
              </button>

            <button
              onClick={() => {
                let args = {
                  callbackKey:"testKey",
                  funcs: {
                    // onAfterOpen: function() {console.log("callback onAfterOpen")},
                    // onAfterClose: function() {console.log("callback onAfterClose")},
                    // onRequestClose: function() {console.log("callback onRequestClose")},
                    onConfirm: function() {console.log("callback onConfirm")},
                    onDeny: function() {console.log("callback onDeny")},
                  },
                  message: "test message"
                }
                console.log("test")

              }
            }
              style={{width: '150px', padding: '5px', margin: '5px'}}
              >
              alert test
              </button>

              <button
                onClick={async () => {dispatch(confirmationDialog({"target": nearbySearchSlice}))}}
                style={{width: '150px', padding: '5px', margin: '5px'}}
                >
                alert test 2
                </button>


              <button
                onClick={() => {
                  googlePlacesApiManager.nearbySearch()
                }
              }
                style={{width: '150px', padding: '5px', margin: '5px'}}
                >
                service call test
                </button>

            <button
              onClick={() => {
                dispatch(alertDialog(
                  {
                    "target": () => {dispatch(nearbySearchSlice())},
                    "alertKey": "search"
                  }
                ))}
              }
              style={{width: '150px', padding: '5px', margin: '5px'}}
              >
              nearby search
              </button>

          <button onClick={() => {console.log(editorRef)}}>
          Open Modal
          </button>
    </div>
  )

}
