import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { DrawPolygonMode } from 'react-map-gl-draw';
import { FilePicker } from '../../components/FilePicker.js'
import { searchPlaces, setBulkSearchCount, getData } from './searchSlice'
import { googlePlacesApiManager } from '../../googleAPI/googlePlacesApiManager'

export function SearchInterface(props) {
  const dispatch = useDispatch()
  const {
    setMode,
    onDelete,
    initializeSearch,
    nearbySearch,
    buildFromFile,
    editorRef,
    searchActive,
    priorSearch,
    bulkSearch,
  } = props

  // const [newSearch, setNewSearch] = useState(true)
  const [callType, setCallType] = useState('singleSearch')
  // const [searchBuilt, setSearchBuilt] = useState(false)
  const bulkSearchCount = useSelector(state => state.search.bulkSearchCount)
  const mapPolygons = useSelector(state => state.map.mapPolygons)
  const polygonCoordinates = useSelector(state => state.map.polygonCoordinates)

  // function buildSearch() {
  //   initializeSearch(dispatch)
  // }

  function onChangeBulkQtyInput(e) {
    dispatch(setBulkSearchCount(e.target.value))
  }

  function newSearchTools() {
      return (
        <div style={{flex: '1', flexDirection: 'row'}}>
          <div
            style={
              {padding: '10px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-star',
              alignItems: 'flex-end'
              }}
            >

            <div style={{display: 'flex', flexDirection: 'column'}}>
              <button
                onClick={() => {
                  setMode(new DrawPolygonMode())}
                }
                style={{padding: '5px', margin: '5px', width: '150px'}}
                disabled={searchActive}
                >
                Select Search Area
                </button>

                <button
                  title="Delete"
                  onClick={onDelete}
                  style={{padding: '5px', margin: '5px', width: '150px'}}
                  disabled={searchActive}
                  >
                  Delete Search Area
                  </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <button
                onClick={initializeSearch}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                disabled={searchActive}
                >
                Build Search
                </button>

              <button
                onClick={nearbySearch}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Single Search
                </button>

              <button
                onClick={() => {googlePlacesApiManager.nearbySearch()}}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Single Search new
                </button>

              <button
                onClick={async () => {
                  for (let i = 0; i < 4; i++) {
                    console.log(i)
                    await dispatch(searchPlaces())
                  }
                  // console.log(dispatch(searchPlaces()))
                }}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                slice searchPlaces
                </button>

              <button
                onClick={() => console.log(window.google)}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Window.google
                </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column'}}>
              <button
                onClick={bulkSearch}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Bulk Search
                </button>

                <input
                  type="number"
                  value={bulkSearchCount == 0 ? "Bulk Search Qty" : bulkSearchCount}
                  min="0"
                  onKeyDown={ (evt) => ['e', '.', '-'].includes(evt.key) && evt.preventDefault() }
                  onChange={(e) => onChangeBulkQtyInput(e)}
                  style={{ padding: '5px', margin: '5px', textAlign: 'center'}}
                  placeholder="Bulk Search Qty"
                  />
            </div>
          </div>
        </div>
      )
  }

  function loadSearchTools() {
      return (
        <div style={{flex: '1', flexDirection: 'row'}}>

          <div
            style={
              {padding: '10px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-star',
              alignItems: 'flex-end'
              }}
            >

            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <FilePicker
                disabled={searchActive}
                />
            </div>

            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <button
                onClick={() => buildFromFile()}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                disabled={searchActive}
                >
                Build Search From File
                </button>

              <button
                onClick={nearbySearch}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Single Search
                </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <button
                onClick={() => console.log("bulkSearch()")}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Bulk Search
                </button>
              <input
                type="number"
                value={bulkSearchCount == 0 ? false : bulkSearchCount}
                min="0"
                onKeyDown={ (evt) => ['e', '.', '-'].includes(evt.key) && evt.preventDefault() }
                onChange={(e) => onChangeBulkQtyInput(e)} style={{ padding: '5px', margin: '5px', textAlign: 'center'}}
                placeholder="Bulk Search Qty"
                />
            </div>
          </div>
        </div>
      )
  }

  // function toggleSearchType() {
  //   setNewSearch(newSearch => !newSearch)
  // }

  function conditionalRender() {
    if (!priorSearch) {
      return newSearchTools()
    } else {
      return loadSearchTools()
    }
  }

  return (
    conditionalRender()
  )
}
