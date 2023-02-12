import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { DrawPolygonMode } from 'react-map-gl-draw';
import { searchPlaces, setBulkSearchCount, getData } from './searchSlice'
import { googlePlacesApiManager } from '../../googleAPI/googlePlacesApiManager'
import { SearchInterfaceButton } from '../../components/SearchInterfaceButton'

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

  const bulkSearchCount = useSelector(state => state.search.bulkSearchCount)

  function onChangeBulkQtyInput(e) {
    dispatch(setBulkSearchCount(e.target.value))
  }

  function renderTitle(){
    return "Search Options"
  }

  function renderSearchTools() {
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


                <SearchInterfaceButton
                  onClick={() => {
                    setMode(new DrawPolygonMode())}
                  }
                  style={{padding: '5px', margin: '5px', width: '150px'}}
                  disabled={searchActive}
                  >
                  Select Search Area
                </SearchInterfaceButton>

                <SearchInterfaceButton
                  title="Delete"
                  onClick={onDelete}
                  disabled={searchActive}

                  >
                  <div style={{fontSize: 14, color: 'white', fontWeight: 'bold'}}>Delete Search Area</div>
                  </SearchInterfaceButton>


            </div>

            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
              <SearchInterfaceButton
                onClick={initializeSearch}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                disabled={searchActive}
                >
                Build Search
                </SearchInterfaceButton>

              <SearchInterfaceButton
                onClick={nearbySearch}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Single Search
                </SearchInterfaceButton>

            </div>

            <div style={{display: 'flex', flexDirection: 'column'}}>
              <SearchInterfaceButton
                onClick={bulkSearch}
                style={{padding: '5px', margin: '5px', width: '150px'}}
                >
                Bulk Search
                </SearchInterfaceButton>

                <input
                  type="number"
                  value={bulkSearchCount == 0 ? "Bulk Search Qty" : bulkSearchCount}
                  min="0"
                  onKeyDown={ (evt) => ['e', '.', '-'].includes(evt.key) && evt.preventDefault() }
                  onChange={(e) => onChangeBulkQtyInput(e)}
                  style={{ borderRadius: '15px', padding: '5px', margin: '5px', textAlign: 'center', borderWidth: '0px'}}
                  placeholder="Bulk Search Qty"
                  />
            </div>
          </div>
        </div>
      )
  }

  return (
    <div style={{textAlign: 'center', color: '#36B569', fontWeight: 'bold'}}>
      {renderTitle()}
      {renderSearchTools()}
    </div>
  )
}
