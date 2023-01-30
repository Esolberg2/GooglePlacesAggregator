import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { mapActions } from '../map/mapSlice'
import { wrapperActions } from '../stateWrapper/wrapperSlice'
import { SettingsButton } from '../../components/SettingsButton'
import { SettingsTextContainer } from '../../components/SettingsTextContainer'
import { ToggleSlider }  from "react-toggle-slider";
import SpinnerButton from '../../components/SpinnerButton'
import CurrencyInput from 'react-currency-input-field';
import { setPriorSearch } from '../search/searchSlice'
import { googlePlacesApiManager } from '../../googleAPI/googlePlacesApiManager'
import { settingsPanelActions } from './settingsPanelSlice'
import { alertDialog, confirmationDialog } from '../modal/modalSlice'
import { ModalBuilder } from '../modal/ModalBuilder'
const placeTypes = require('../../data/placeTypes.json');

export function SettingsPanel(props) {
  const dispatch = useDispatch()
  const searchData = useSelector((state) => state.search)
  const settingsData = useSelector((state) => state.settingsPanel)
  const mapData = useSelector(state => state.map)

  const {
  priorSearch
  } = searchData

  const {
    budget,
    budgetUsed,
    searchResolution,
    testMode,
    searchEntityType,
    userSearchKey,
    apiKey,
    apiKeyStale
  } = settingsData

  const {
    setSearchEntityType,
    setSearchResolution,
    setBudget,
    setTestMode,
    setApiKey,
    setApiKeyStale
  } = settingsPanelActions

const downloadFile = ({ data, fileName, fileType }) => {
  const blob = new Blob([data], { type: fileType })
  const a = document.createElement('a')
  a.download = fileName
  a.href = window.URL.createObjectURL(blob)
  const clickEvt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  })
  a.dispatchEvent(clickEvt)
  a.remove()
}

const exportToJson = e => {
  e.preventDefault()
  let datetime = new Date().toLocaleString();

  const searchDataObject = {
    "searchedCoords": searchData.searchedCoords,
    "unsearchedCoords": searchData.unsearchedCoords,
    "searchedAreas": mapData.searchedAreas,
    "googleData": searchData.googleData,
    "searchEntityType": settingsData.searchEntityType,
    "budget": settingsData.budget,
    "budgetUsed": settingsData.budgetUsed,
    "searchResolution": settingsData.searchResolution,
    "userSearchKey": settingsData.userSearchKey,
    "nextCenter": searchData.nextCenter,
    "lastSearchRadius": searchData.lastSearchRadius,
    "searchID": searchData.searchID,
    "polygonCoordinates": mapData.polygonCoordinates,
    "mapPolygons": mapData.mapPolygons,
  }

  let include = [
  'west',
  'compound_code',
  'viewport',
  'width',
  'types',
  'icon_background_color',
  'place_id',
  'east',
  'opening_hours',
  'name',
  'reference',
  'photos',
  'height',
  'south',
  'getUrl',
  'north',
  'rating',
  'lng',
  'icon',
  'html_attributions',
  'geometry',
  'location',
  'scope',
  'lat',
  'vicinity',
  'plus_code',
  'user_ratings_total',
  'global_code',
  'icon_mask_base_uri',
  'price_level',
  'business_status',
  'type',
  'features',
  'properties',
  'coordinates',
  ...Object.keys(searchDataObject)
  ]

  let d = JSON.stringify(searchDataObject, include)
  downloadFile({
    data: JSON.stringify(searchDataObject, include),
    fileName: `${searchEntityType}_${userSearchKey}_${datetime}.json`,
    fileType: 'text/json',
  })
}

function handleSelectChange(event) {
  dispatch(setSearchEntityType(event.target.value))
}

function handleBudgetChange(value) {
  let cleanValue = isNaN(value) ? 0 : parseFloat(value)
  if (cleanValue < -1) {
      // setBudget(-1)
      dispatch(setBudget(-1))
    } else {
      dispatch(setBudget(value))}
  }

function handleResolutionChange(value) {
  dispatch(setSearchResolution(value))
}

function resolutionInputColor() {
  if (priorSearch) {
    return '#cccccc'
  } else {
    if (searchResolution < 0.1) {
      return '#fde0e0'
    } else {
      return undefined
    }
  }
}

function togglePriorSearch(val) {
  dispatch(setPriorSearch(val))
  // dispatch(confirmationDialog(
  //   {
  //     "target": () => {
  //       // dispatch(resetState())
  //       dispatch(setPriorSearch(val))
  //     },
  //     "alertKey": "changeSearchType"
  //   }
  // ))
}

// useEffect(() => {
//   if (!apiKeyStale) {
//     setApiKeyStale(true)
//   }
// }, [apiKey])

function onChangeAPIkeyInput(e) {
  setApiKey(e.target.value)
}

function renderSearchResolution() {
  if (!priorSearch) {
    return (
      <CurrencyInput
        id="input-example"
        name="input-name"
        placeholder="Search Resolution"
        value={searchResolution}
        decimalsLimit={2}
        onKeyDown = {(evt) => ['e', '-'].includes(evt.key) && evt.preventDefault() }
        onValueChange={handleResolutionChange}
        style={{backgroundColor: resolutionInputColor(), paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', height: '15px', textAlign: 'center'}}
        />
    )
  } else {

    return (
      <input
        type="text"
        disabled={!priorSearch ? false : true}
        value={searchResolution ? searchResolution : 'Loaded from File'}
        style={{ padding: '5px', margin: '5px', textAlign: 'center'}}
        placeholder="Prior Data File"
        />
    )
  }
}

function renderTypeOptions() {
  return placeTypes.map(type => <option key={type} value={type}>{type}</option>)
}
  return (
    <div>
  <div style={{padding: '20px'}}>
    <SettingsButton
      selected={!priorSearch}
      onClick={() => {
        // dispatch(setPriorSearch(false))
        togglePriorSearch(false)
      }}
      >
      New Search
      </SettingsButton>

    <SettingsButton
      selected={priorSearch}
      onClick={() => {
        if (!priorSearch) {
          // dispatch(setPriorSearch(true))
          togglePriorSearch(true)
        }}}
      >
      Load Prior Search
      </SettingsButton>

    <SettingsButton
      onClick={(e) => exportToJson(e)}
      >
      Download Data
      </SettingsButton>

    <SettingsButton
      onClick={(e) =>
        {
          // existingDataWarning(e)
          let modalBuilder = new ModalBuilder()
          modalBuilder.alertKey = 'clearSearch'
          modalBuilder.callback = (result) => {
              // console.log("no callback set")
              dispatch(wrapperActions.reset())

            }
          modalBuilder.errorback = (error) => {
              console.log("reject callback run")
              console.log(error)
            }
          modalBuilder.run()
        }
      }
      >
      Clear Search
      </SettingsButton>

    <SettingsButton
      onClick={() => {
        console.log("updateGoogleApi")
        googlePlacesApiManager.updateGoogleApi('AIzaSyBhJRgpD2FTMa8_q68645LQRb2qNVD6wlE')
        }
      }
      >
      load google service
      </SettingsButton>

    <SettingsButton
      onClick={() => {googlePlacesApiManager.removeGoogle()}}
      >
      remove google
      </SettingsButton>
  </div>

  <div style={{display: 'flex', flexDirection: 'row'}}>
    <SettingsTextContainer
      title={'Test Without Google Key'}
      description={'Use dummy data to try out the tool.'}
      style={{display: 'flex', flex: '1'}}
      >
        <ToggleSlider
          onToggle={() => {
            dispatch(setTestMode(!testMode))
          }
          }
          active={testMode}
          barWidth={75}
          />
    </SettingsTextContainer>

    <SettingsTextContainer
      title={'Enter Google API Key'}
      description={'The Key will not be saved and is only used to call the google places API directly.'}
      >
        <div style={{ flex: '1', display: 'flex', flexDirection: 'row', alignItems: 'flex-end'}}>
          <input
            value={apiKey}
            onChange={(e) => dispatch(setApiKey(e.target.value))}
            style={{ marginLeft: '5px', height: '15px', paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', textAlign: 'center'}}
            placeholder="Google API Key"
            disabled={testMode}
            />

            <SpinnerButton
              func={googlePlacesApiManager.updateGoogleApi}
              funcArgs={[apiKey]}
              height='15px'
              width='47px'
              onClick={() => dispatch(setApiKeyStale(false))}
              buttonStyle={{backgroundColor: apiKeyStale ? '#fde0e0' : 'none'}}
              buttonKey={apiKeyStale}
              disabled={testMode}
              >
              {apiKeyStale ? 'Set Key' : 'Key Set'}
            </SpinnerButton>
        </div>
    </SettingsTextContainer>

    <SettingsTextContainer
      title={'Search Entity Type'}
      description={'These types are dictated by Google, and are limited to one type per search.'}
      >
        <select key={searchEntityType} disabled={!priorSearch ? false : true} value={searchEntityType} onChange={handleSelectChange} id="typeSelect" style={{paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', textAlign: 'center'}}>
          {renderTypeOptions()}
        </select>
    </SettingsTextContainer>

    <SettingsTextContainer
      title={'Budget'}
      description={'Enter -1 for unlimited budget: use this option with care.'}
      >
        <CurrencyInput
          prefix="$"
          id="input-example"
          name="input-name"
          placeholder="Enter a max budget"
          defaultValue={budget}
          value={budget}
          decimalsLimit={2}
          onValueChange={(value) => handleBudgetChange(value)}
          style={{paddingTop: '5px', paddingBottom: '5px', marginTop: '20px', marginBottom: '5px', height: '15px', textAlign: 'center'}}
          />
        <SettingsTextContainer title={'Budget Used'}>
            <CurrencyInput
              prefix="$"
              id="input-example"
              name="input-name"
              placeholder="0"
              value={budgetUsed}
              disabled={true}
              decimalsLimit={4}
              style={{paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', height: '15px', textAlign: 'center'}}
              />
        </SettingsTextContainer>
    </SettingsTextContainer>

    <SettingsTextContainer
    title={'Search Resolution'}
    description={'This is the spacing between search coordinates within the search region. The minimum resolution is 0.1 miles.'}
    >
    {renderSearchResolution()}
    </SettingsTextContainer>
  </div>
  </div>
)

}
