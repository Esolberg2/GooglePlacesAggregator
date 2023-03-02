import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { DrawPolygonMode } from 'react-map-gl-draw';
import { setBulkSearchCount } from './searchSlice';
import SearchInterfaceButton from '../../components/SearchInterfaceButton';

function SearchInterface(props) {
  const dispatch = useDispatch();
  const {
    setMode,
    onDelete,
    initializeSearch,
    singleSearch,
    searchActive,
    bulkSearch,
    budgetUsed,
    loading,
    editorRef,
  } = props;

  const bulkSearchCount = useSelector((state) => state.search.bulkSearchCount);

  function onChangeBulkQtyInput(e) {
    dispatch(setBulkSearchCount(e.target.value));
  }

  function renderTitle() {
    return 'Search Options';
  }

  function renderSearchTools() {
    return (
      <div
        style={{
          flex: '1', flexDirection: 'row',
        }}
      >
        <div
          style={{
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-star',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <SearchInterfaceButton
              onClick={() => {
                setMode(new DrawPolygonMode());
              }}
              disabled={searchActive}
            >
              Select Search Area
            </SearchInterfaceButton>

            <SearchInterfaceButton
              title="Delete"
              onClick={onDelete}
              disabled={searchActive}
            >
              <div
                style={{
                  fontSize: 14,
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                Delete Search Area
              </div>
            </SearchInterfaceButton>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <SearchInterfaceButton
              onClick={() => {
                const refMode = editorRef.current.props.mode;
                // eslint-disable-next-line no-underscore-dangle
                const drawMode = !!refMode._clickSequence;
                // eslint-disable-next-line no-underscore-dangle
                const vertexCount = drawMode ? refMode._clickSequence.length : 0;
                const lineError = drawMode && vertexCount > 0;
                dispatch(initializeSearch({ lineError }));
              }}
              disabled={searchActive}
            >
              Build Search
            </SearchInterfaceButton>
            <SearchInterfaceButton
              onClick={() => {
                dispatch(singleSearch());
              }}
              disabled={loading}
            >
              Single Search
            </SearchInterfaceButton>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <input
              type="number"
              value={bulkSearchCount === 0 ? '' : bulkSearchCount}
              min="0"
              onKeyDown={(evt) => ['e', '.', '-'].includes(evt.key) && evt.preventDefault()}
              onChange={(e) => onChangeBulkQtyInput(e)}
              style={{
                borderRadius: '15px',
                padding: '5px',
                margin: '5px',
                textAlign: 'center',
                borderWidth: '0px',
              }}
              placeholder="Bulk Search Qty"
            />
            <SearchInterfaceButton
              onClick={() => {
                dispatch(bulkSearch());
              }}
              disabled={loading}
            >
              Bulk Search
            </SearchInterfaceButton>
          </div>

        </div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: '300',
            display: 'flex',
            flex: '1',
            justifyContent: 'center',
            paddingBottom: '10px',
          }}
        >
          Budget Spent: $
          {budgetUsed.toFixed(4)}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        textAlign: 'center',
        color: '#36B569',
        fontWeight: 'bold',
      }}
    >
      {renderTitle()}
      {renderSearchTools()}
    </div>
  );
}

SearchInterface.propTypes = {
  setMode: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  initializeSearch: PropTypes.func.isRequired,
  singleSearch: PropTypes.func.isRequired,
  searchActive: PropTypes.bool.isRequired,
  bulkSearch: PropTypes.func.isRequired,
  budgetUsed: PropTypes.number.isRequired,
  loading: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  editorRef: PropTypes.object.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  mode: PropTypes.object.isRequired,
};

export default SearchInterface;
