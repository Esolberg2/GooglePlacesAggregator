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
// import { googlePlacesApiManager2 } from '../../googleAPI/googlePlacesApiManagerWeb'
import { settingsPanelActions } from './settingsPanelSlice'
// import { ModalBuilder } from '../modal/ModalBuilder'
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

  let include = [
  // 'west',
  // 'compound_code',
  // 'viewport',
  // 'width',
  // 'types',
  // 'icon_background_color',
  // 'place_id',
  // 'east',
  // 'opening_hours',
  // 'name',
  // 'reference',
  // 'photos',
  // 'height',
  // 'south',
  // 'getUrl',
  // 'north',
  // 'rating',
  // 'lng',
  // 'icon',
  // 'html_attributions',
  // 'geometry',
  // 'location',
  // 'scope',
  // 'lat',
  // 'vicinity',
  // 'plus_code',
  // 'user_ratings_total',
  // 'global_code',
  // 'icon_mask_base_uri',
  // 'price_level',
  // 'business_status',
  // 'type',
  // 'features',
  // 'properties',
  // 'coordinates',
  // 'testMode',
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
    // else if (val == true) {
    //   inputRef.current.click()
    // }
  }

// function togglePriorSearch(val) {
//     if (val == true || val != priorSearch) {
//       console.log(inputRef)
//       let modalBuilder = new ModalBuilder()
//       modalBuilder.alertKey = 'clearSearch'
//       modalBuilder.callback = (result) => {
//           dispatch(wrapperActions.reset())
//           dispatch(setPriorSearch(val))
//           if (val == true) {
//             inputRef.current.click()
//           }
//         }
//       modalBuilder.errorback = (error) => {
//           console.log("reject callback run")
//           console.log(error)
//         }
//       modalBuilder.run()
//     }
//     // else if (val == true) {
//     //   inputRef.current.click()
//     // }
//
//
//
//
//   // if (!priorSearch) {
//   //     let modalBuilder = new ModalBuilder()
//   //     modalBuilder.alertKey = 'clearSearch'
//   //     modalBuilder.callback = (result) => {
//   //         dispatch(wrapperActions.reset())
//   //         dispatch(setPriorSearch(true))
//   //         inputRef.current.click()
//   //       }
//   //     modalBuilder.errorback = (error) => {
//   //         console.log("reject callback run")
//   //         console.log(error)
//   //       }
//   //     modalBuilder.run()
//   // } else {
//   //   inputRef.current.click()
//   // }
// }

// useEffect(() => {
//   if (!apiKeyStale) {
//     setApiKeyStale(true)
//   }
// }, [apiKey])

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
        disabled={priorSearch}
        onKeyDown = {(evt) => ['e', '-'].includes(evt.key) && evt.preventDefault() }
        onValueChange={handleResolutionChange}
        style={{backgroundColor: resolutionInputColor(), paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', height: '15px', textAlign: 'center'}}
        />
    )
}

function loadFile(value) {
  console.log("---- LOAD FILE-----")
  let fileReader = new FileReader();
  fileReader.onloadend = (e) => {
    const content = fileReader.result;
    dispatch(loadStateFromFile(JSON.parse(content)))
  };

  if (value.target.files) {
    fileReader.readAsText(value.target.files[0]);
  }

}

// function setNewSearch() {
//   if (priorSearch) {
//       let modalBuilder = new ModalBuilder()
//       modalBuilder.alertKey = 'clearSearch'
//       modalBuilder.callback = (result) => {
//           dispatch(wrapperActions.reset())
//           dispatch(setPriorSearch(false))
//         }
//       modalBuilder.errorback = (error) => {
//           console.log("reject callback run")
//           console.log(error)
//         }
//       modalBuilder.run()
//   }
// }

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
              // togglePriorSearch()
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
              // {
              //   let modalBuilder = new ModalBuilder()
              //   modalBuilder.alertKey = 'clearSearch'
              //   modalBuilder.callback = (result) => {
              //       dispatch(wrapperActions.reset())
              //
              //     }
              //   modalBuilder.errorback = (error) => {
              //       console.log("reject callback run")
              //       console.log(error)
              //     }
              //   modalBuilder.run()
              // }
            }
            >
          Clear Search
          </SettingsButton>

          <SettingsButton
            onClick={async (e) =>
              {

                let selectedAction = await buildModal({
                  "alertKey": 'clearSearch',
                  "data": null,
                  "confirmCallback": () => {console.log("confirm callback")},
                  "denyCallback": () => {console.log("deny callback")}
                })
                console.log(selectedAction)
              }
            }
            >
          Modal Test
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
        description={'Test out the tool without needing a Google API key.  All data generated in Test Mode is complete nonsense.'}
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
        description={'This API key will need permissoins to Google Maps API and Google Places API.  Your API key is used to make requests directly to the Google API and will not be saved by any component of this website.'}
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
        description={'These types are dictated by Google, and are limited to one type per search.'}
        >
          <select key={searchEntityType} disabled={!priorSearch ? false : true} value={searchEntityType} onChange={handleSelectChange} id="typeSelect" style={{paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', textAlign: 'center'}}>
            {renderTypeOptions()}
          </select>
      </SettingsTextContainer>

      <SettingsTextContainer
        title={'Budget'}
        description={'Use this setting to limit your expenses.  It is also wise to set billing quotas within the Google Cloud Console to ensure no unexpected expenditures are encountered. Enter -1 for unlimited budged: Use this option with EXTREME care.'}
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
      description={'This is the spacing between search coordinates within the search region. The minimum resolution is 0.1 miles.'}
      >
      {renderSearchResolution()}
      </SettingsTextContainer>
    </div>
  </div>
)

}
