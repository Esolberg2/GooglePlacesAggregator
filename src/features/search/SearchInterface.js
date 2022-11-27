import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { DrawPolygonMode } from 'react-map-gl-draw';
import { FilePicker } from '../../components/FilePicker.js'
import { setBulkSearchCount } from './searchSlice'

export function SearchInterface(props) {
  const dispatch = useDispatch()
  const {
    setMode,
    onDelete,
    initializeSearch,
    nearbySearch,
    buildFromFile,
    editorRef,
  } = props

  const [newSearch, setNewSearch] = useState(true)
  const [callType, setCallType] = useState('singleSearch')
  const [searchBuilt, setSearchBuilt] = useState(false)
  const bulkSearchCount = useSelector(state => state.search.bulkSearchCount)

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
                disabled={searchBuilt}
                >
                Select Search Area
                </button>

                <button
                  title="Delete"
                  onClick={onDelete}
                  style={{padding: '5px', margin: '5px', width: '150px'}}
                  >
                  Delete Search Area
                  </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <button
                onClick={initializeSearch}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                disabled={false}
                >
                Build Search
                </button>

              <button
                onClick={nearbySearch}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Single Search
                </button>
            </div>

            <div style={{display: 'flex', flexDirection: 'column'}}>
              <button
                onClick={() => console.log("bulkSearch()")}
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
                disabled={searchBuilt}
                />
            </div>

            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <button
                onClick={() => buildFromFile()}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                disabled={searchBuilt}
                >
                Build Search From File
                </button>

              <button
                onClick={() => setCallType('singleSearch')}
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

  function toggleSearchType() {
    setNewSearch(newSearch => !newSearch)
  }

  function conditionalRender() {
    if (newSearch) {
      return newSearchTools()
    } else {
      loadSearchTools()
    }
  }

  return (
    conditionalRender()
  )
}
