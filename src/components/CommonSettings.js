
// newSearch
// state for export to json
// apiKey
// budget
// setBudget
// searchResolution


const CommonSettings = () => {

    return (
        <div style={{flex: '1', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <div style={{paddingRight: '20px', justifyContent: 'flex-end', display: 'flex', flexDirection: 'column', width: '250px'}}>
            <button
              onClick={() => {
                if (!newSearch) {
                  selectNewSearch(true)
                }}}
              style={{padding: '5px', margin: '5px', backgroundColor: newSearch ? '#cccccc' : undefined }}
              >
              New Search
              </button>

            <button
              onClick={() => {
                if (newSearch) {
                  selectNewSearch(false)
                }}}
              style={{padding: '5px', margin: '5px', backgroundColor: newSearch ? undefined : '#cccccc'}}
              >
              Load Prior Search
              </button>

            <button
              onClick={(e) => exportToJson(e)}
              style={{padding: '5px', margin: '5px'}}
              >
              Download Data
              </button>
          </div>

          <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', flex: '1' }}>
            Choose an Entity Type to Search
            <div style={{ paddingTop: '10px', fontSize: '12px', display: 'flex', textAlign: 'center', justifyContent: 'center'}}>
              These types are dictated by Google, and are limited
              to one type per search.
            </div>
            <div style={{ flexGrow: '1'}}/>
            <select disabled={newSearch ? false : true} value={searchType} onChange={handleSelectChange} id="typeSelect" style={{paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', textAlign: 'center'}}>
              {renderTypeOptions()}
            </select>
          </div>

          <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', flex: '1'}}>
            Enter Google API Key
            <div style={{ paddingTop: '10px', fontSize: '12px', display: 'flex', textAlign: 'center', justifyContent: 'center'}}>
              The Key will not be saved and is only used to call the google places API directly.
            </div>
            <div style={{ flexGrow: '1'}}/>
            <div style={{ flex: '1', display: 'flex', flexDirection: 'row', alignItems: 'flex-end'}}>
              <input
                value={apiKey}
                onChange={(e) => onChangeAPIkeyInput(e)}
                style={{ marginLeft: '5px', height: '15px', paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', textAlign: 'center'}}
                placeholder="Google API Key"
                />

                <SpinnerButton
                  func={updateGoogleApi}
                  funcArgs={[apiKey]}
                  height='15px'
                  width='47px'
                  >
                  Set Key
                  </SpinnerButton>
            </div>
          </div>

          <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', flex: '1'}}>
            Set Budget
            <div style={{ paddingTop: '10px', fontSize: '12px', display: 'flex', textAlign: 'center', justifyContent: 'center'}}>
              Enter -1 for unlimited budget: use this option with care.
            </div>
              <CurrencyInput
                prefix="$"
                id="input-example"
                name="input-name"
                placeholder="Enter a max budget"
                defaultValue={budget}
                value={budget}
                decimalsLimit={2}
                onValueChange={(value) => handleBudgetChange(value)}
                style={{paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', height: '15px'}}
                />
            <div style={{ flexGrow: '1'}}/>
              Budget Used
              <CurrencyInput
                prefix="$"
                id="input-example"
                name="input-name"
                placeholder="Enter a max budget"
                value={budgetUsed}
                disabled={true}
                decimalsLimit={4}
                style={{paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', height: '15px'}}
                />
          </div>

          <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', flex: '1'}}>
            Enter User Key
            <div style={{ fontSize: '12px', paddingTop: '10px'}}>
              This key is anything you want, and is used to organize your search data.
            </div>
            <div style={{ flexGrow: '1'}}/>
            <input
              value={userSearchKey}
              onChange={(e) => onChangeUserKey(e)}
              style={{ paddingTop: '5px', paddingBottom: '5px', marginTop: '5px', marginBottom: '5px', textAlign: 'center'}}
              placeholder="Custom User Key"
              />
          </div>

          <div style={{ paddingLeft: '5px', paddingRight: '5px', paddingTop: '5px', display: 'flex', flexDirection: 'column', textAlign: 'center', flex: '1'}}>
            Enter Search Resolution
            <div style={{ fontSize: '12px', paddingTop: '10px'}}>
              This is the spacing between search coordinates within the search region.
              The minimum resolution is 0.1 miles.
            </div>
            <div style={{ flexGrow: '1'}}/>
            {renderSearchResolution()}
          </div>

        </div>
      )
    }
}
