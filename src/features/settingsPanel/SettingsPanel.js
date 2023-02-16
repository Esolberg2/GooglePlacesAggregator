import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { mapActions } from '../map/mapSlice'
import { wrapperActions } from '../stateWrapper/wrapperSlice'
import { SettingsButton } from '../../components/SettingsButton'
import { SettingsTextContainer } from '../../components/SettingsTextContainer'
import Switch from "react-switch";
import SpinnerButton from '../../components/SpinnerButton'
import CurrencyInput from 'react-currency-input-field';
import { loadStateFromFile, setPriorSearch } from '../search/searchSlice'
import { googlePlacesApiManager } from '../../googleAPI/googlePlacesApiManager'
import { settingsPanelActions } from './settingsPanelSlice'
import { buildModal } from '../modal/modalSlice'
import {
  setFileData,
  setFileName
} from '../loadFile/loadFileSlice'
const placeTypes = require('../../data/placeTypes.json');
const infoMessages = require('../../data/informationText.json');

export function SettingsPanel(props) {
  const dispatch = useDispatch()
  const searchData = useSelector((state) => state.search)
  const settingsData = useSelector((state) => state.settingsPanel)
  const mapData = useSelector((state) => state.map)
  const inputRef = useRef();
  const fileData = useSelector((state) => state.loadFile.fileData)


  const {
  priorSearch,
  searchActive
  } = searchData

  const {
    budget,
    budgetUsed,
    searchResolution,
    testMode,
    searchEntityType,
    userSearchKey,
    apiKey,
    apiKeyStale,
    googlePlacesLibLoading
  } = settingsData

  const {
    setSearchEntityType,
    setSearchResolution,
    setBudget,
    setTestMode,
    setApiKey,
    setApiKeyStale,
    setGooglePlacesLibLoading
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
      "testMode": settingsData.testMode
    }

    // let include = [
    // ...Object.keys(searchDataObject)
    // ]

    let d = JSON.stringify(searchDataObject)
    downloadFile({
      data: JSON.stringify(searchDataObject),
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


  async function togglePriorSearch(val) {
      if (val == true || val != priorSearch) {

        let selectedAction = await buildModal({
          "alertKey": 'clearSearch',
          "data": null,
          "confirmCallback": (result) => {
              dispatch(wrapperActions.reset())
              dispatch(setPriorSearch(val))
              if (val == true) {
                inputRef.current.click()
              }
            },
          "denyCallback": (error) => {
            console.log(error)
            }
        })
        selectedAction()
      }
    }

  function onChangeAPIkeyInput(e) {
    setApiKey(e.target.value)
  }

  function renderSearchResolution() {
      return (
        <CurrencyInput
          id="input-example"
          name="input-name"
          placeholder="Search Resolution"
          value={searchResolution}
          decimalsLimit={2}
          disabled={searchActive}
          onKeyDown = {(evt) => ['e', '-'].includes(evt.key) && evt.preventDefault() }
          onValueChange={handleResolutionChange}
          style={{backgroundColor: resolutionInputColor(), paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', height: '15px', textAlign: 'center'}}
          />
      )
  }

  function loadFile(value) {
    let fileReader = new FileReader();
    fileReader.onloadend = (e) => {
      const content = fileReader.result;
      dispatch(loadStateFromFile(JSON.parse(content)))
    };

    if (value.target.files) {
      fileReader.readAsText(value.target.files[0]);
    }
  }

  function renderTypeOptions() {
    return placeTypes.map(type => <option key={type} value={type}>{type}</option>)
  }

  return (
    <div style={{}}>
      <input
        ref={inputRef}
        onChange={e => loadFile(e)}
        onClick={(event)=> {
                 event.target.value = null
            }}
        multiple={false}
        type="file"
        accept='.json'
        hidden
      />
      <div style={{display: 'flex'}}>
        <div style={{display: 'flex', padding: '20px', flexDirection: 'column'}}>
          <SettingsButton
            selected={!priorSearch}
            onClick={() => {
              togglePriorSearch(false)
            }}
            >
            New Search
            </SettingsButton>

          <SettingsButton
            selected={priorSearch}
            onClick={(e) => {
              togglePriorSearch(true)
            }
          }

            >
            Load Prior Search
            </SettingsButton>

          <SettingsButton
            onClick={(e) => exportToJson(e)}
            >
            Download Data
            </SettingsButton>

          <SettingsButton
            onClick={async (e) =>

              {
                let selectedAction = await buildModal({
                  "alertKey": 'clearSearch',
                  "data": null,
                  "confirmCallback": () => {
                    dispatch(wrapperActions.reset())
                  },
                  "denyCallback": (error) => {
                    console.log(error)
                    }
                })
                selectedAction()
              }
            }
            >
          Clear Search
          </SettingsButton>

        </div>
        <div style={{flex: '1', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', display: 'flex', fontSize: '25px'}}>
          Google Places Data Helper
          <div
            style={{ margin: '5px', marginBottom: '30px', fontSize: '12px', fontWeight: 'bold', color: '#0000EE', textDecorationLine: 'underline'}}
            onClick={() => alert(infoMessages["about"])}
            >
            About
          </div>
        </div>
    </div>

    <div style={{display: 'flex', flexDirection: 'row'}}>
      <SettingsTextContainer
        title={'Test Mode'}
        popupTitle={'Test Mode'}
        description={
          <div>
          <p>Test out the tool without needing a Google API key.</p>
          <p>While in test mode, only placeholder data is generated and all searches are simulated using randomly generated search radiuses.</p>
          </div>
        }
        style={{display: 'flex', flex: '1'}}
        >
          <div style={{ paddingBottom: '5px' }}>
          <Switch
            onChange={() => {
              dispatch(setTestMode(!testMode))
            }}
            checked={testMode}
            disabled={searchActive}
            uncheckedIcon={false}
            checkedIcon={false}
            width={75}
            id="test-mode-switch"
            />
          </div>
      </SettingsTextContainer>

      <SettingsTextContainer
        title={'Enter Google API Key'}
        popupTitle={'Google API Key'}
        description={
          <div>
          <p>Enter your API key generated from the Google Cloud Console under the Google Maps Platform settings.</p>
          <p>A Google API key is required to use this tool with live data.</p>
          <p>Your key will not be saved and is only used to make requests directly to the Google Places API</p>
          </div>
        }
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
                height='15px'
                width='47px'
                onClick={() => {googlePlacesApiManager.updateGoogleApi(apiKey)}}
                buttonStyle={{backgroundColor: apiKeyStale ? '#fde0e0' : 'none'}}
                buttonKey={apiKeyStale}
                disabled={testMode}
                loading = {googlePlacesLibLoading}
                >
                {apiKeyStale ? 'Set Key' : 'Key Set'}
              </SpinnerButton>
          </div>
      </SettingsTextContainer>

      <SettingsTextContainer
        title={'Search Entity Type'}
        popupTitle={'Search Entity Type'}
        description={
          <div>
          <p>Search Entity Type is the classification of the type of venue or location that you will be querying the Google API for.</p>
          <p>Only one Entity Type can be used per search.</p>
          <p>The list of available Search Entity Types is set by Google. Custom types cannot be entered.</p>
          <p>Google Places entities often are classified as multiple Entity Types.  For example, a Bar is often also classified as a Restaurant, and vice versa.</p>
          </div>
        }
        >
          <select key={searchEntityType} disabled={searchActive} value={searchEntityType} onChange={handleSelectChange} id="typeSelect" style={{paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', textAlign: 'center'}}>
            {renderTypeOptions()}
          </select>
      </SettingsTextContainer>

      <SettingsTextContainer
        title={'Budget'}
        popupTitle={'Budget'}
        description={
          <div>
          <p>!!! Please set quotas on your Google API key directly within the Google Cloud Console.  This will ensure that you do not accidentally accure unexpected Google API fees !!!.</p>
          <p>This budget setting is a convenience feature to help manager your expenditures on the Google Places API, however this website is in beta, and as such all users should protect their budget limits directly within the Google Cloud Console.</p>
          </div>
        }
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

      </SettingsTextContainer>

      <SettingsTextContainer
      title={'Search Resolution'}
      popupTitle={'Search Resolution'}
      description={
        <div>
        <p>Search Resolution is the distance between potential coordinates that this tool can use for any singular Google Places API request, measured in miles.</p>
        <p>The smaller the resolution setting, the more likely a search will be to find all venues that match the selected Entity Type. A smaller resolution will also result in longer processing times for searches.</p>
        <p>The smallest available resolution is 0.1 miles. </p>
        </div>
      }
      >
      {renderSearchResolution()}
      </SettingsTextContainer>
    </div>
  </div>
)}
